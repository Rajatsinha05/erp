import { Model, Query } from 'mongoose';
import { IVisitor } from '@/types/models';
export interface IVisitorModel extends Model<IVisitor> {
    findByCompany(companyId: string): Query<IVisitor[], IVisitor>;
    findCurrentlyInside(companyId: string): Query<IVisitor[], IVisitor>;
    findByHost(companyId: string, hostId: string): Query<IVisitor[], IVisitor>;
    findScheduledToday(companyId: string): Query<IVisitor[], IVisitor>;
    findOverstaying(companyId: string): Query<IVisitor[], IVisitor>;
}
declare const _default: IVisitorModel;
export default _default;
//# sourceMappingURL=Visitor.d.ts.map