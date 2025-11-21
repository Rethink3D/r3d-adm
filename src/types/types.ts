export enum OrderStatusEnum {
  AWAITING_PAYMENT = 'awaiting_payment',
  AWAITING_MAKER = 'awaiting_maker',
  ON_GOING = 'on_going',
  DELAYED = 'delayed',
  NEW_DEADLINE = 'new_deadline',
  READY = 'ready',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  REFUND_IN_ANALYSIS = 'refund_in_analysis',
  REFUND_IN_PROCESS = 'refund_in_process',
  PARTIAL_REFUND = 'partial_refund',
  REFUNDED = 'refunded',
  DONE = 'done',
}