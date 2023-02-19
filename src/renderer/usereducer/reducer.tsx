export type RState = {
  listData: [];
};

export type RAction = {
  type: 'insert' | 'update' | 'delete'; // 操作类型
  payload?: any;
};

export const reducer = (state: RState, action: RAction) => {
  switch (action.type) {
    case 'insert':
      return { listData: action.payload };
    case 'update':
      return { listData: action.payload };
    case 'delete':
      return { listData: action.payload };
    default:
      return state;
  }
};
