import { DataSource, EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';
import { GetListQueryResponse, ListQueryDto } from '../dto/list-query.dto';


export const TRANSACTION_CONTEXT = new AsyncLocalStorage<{
  entityManager: EntityManager;
}>();

// 修改 BaseRepository
export class BaseRepository {
  constructor(private dataSource: DataSource) { }

  protected getRepository<T>(entityCls: new () => T): Repository<T> {
    // 从 AsyncLocalStorage 获取事务管理器
    const context = TRANSACTION_CONTEXT.getStore();
    const entityManager = context?.entityManager ?? this.dataSource.manager;
    return entityManager.getRepository(entityCls);
  }

  // 新增通用分页查询方法, 执行自定义筛选
  findList = async<T>(
    entityCls: new () => T,
    params: ListQueryDto,
    whereCallback?: (qb: SelectQueryBuilder<T>) => void,
    orderByCallback?: (qb: SelectQueryBuilder<T>, orderBy: string, orderDirection: "ASC" | "DESC") => void
  ): Promise<GetListQueryResponse<T>> => {

    const repository = this.getRepository(entityCls);
    const { pageIndex = 1, pageSize = 10, orderBy, orderDirection } = params;
    const skip = (pageIndex - 1) * pageSize;
    const queryBuilder = repository.createQueryBuilder("entity");

    if (whereCallback) {
      whereCallback(queryBuilder);
    }

    // 添加排序支持
    if (orderBy && orderDirection) {
      if (orderByCallback) {
        orderByCallback(queryBuilder, orderBy, orderDirection);
      } else {
        // 默认排序实现
        queryBuilder.orderBy(`entity.${orderBy}`, orderDirection);
      }
    }

    // 执行查询
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    // 计算分页元数据
    const totalPages = Math.ceil(total / pageSize);
    const hasPrevPage = pageIndex > 1;
    const hasNextPage = pageIndex < totalPages;

    return {
      items,
      total,
      totalPages,
      page: pageIndex,
      pageSize,
      hasPrevPage,
      hasNextPage,
      timestamp: Date.now()
    };

  }

  // 新增基于DTO的通用列表查询方法
  findListByDto = async<T>(
    entityCls: new () => T,
    dto: any,
    filterFields: string[],
    validOrderFields: string[] = []
  ): Promise<GetListQueryResponse<T>> => {
    const repository = this.getRepository(entityCls);
    const { pageIndex = 1, pageSize = 10, orderBy, orderDirection } = dto;
    const skip = (pageIndex - 1) * pageSize;
    const queryBuilder = repository.createQueryBuilder("entity");

    // 添加筛选条件
    for (const field of filterFields) {
      if (dto[field] !== undefined && dto[field] !== null) {
        // 如果是字符串类型且不为空，则使用LIKE查询
        if (typeof dto[field] === 'string' && dto[field] !== '') {
          queryBuilder.andWhere(`entity.${field} LIKE :${field}`, { [field]: `%${dto[field]}%` });
        } else if (typeof dto[field] !== 'string') {
          // 其他类型使用精确匹配
          queryBuilder.andWhere(`entity.${field} = :${field}`, { [field]: dto[field] });
        }
      }
    }

    // 添加排序支持
    if (orderBy && orderDirection && validOrderFields.includes(orderBy)) {
      queryBuilder.orderBy(`entity.${orderBy}`, orderDirection);
    }

    // 执行查询
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    // 计算分页元数据
    const totalPages = Math.ceil(total / pageSize);
    const hasPrevPage = pageIndex > 1;
    const hasNextPage = pageIndex < totalPages;

    return {
      items,
      total,
      totalPages,
      page: pageIndex,
      pageSize,
      hasPrevPage,
      hasNextPage,
      timestamp: Date.now()
    };
  }
}