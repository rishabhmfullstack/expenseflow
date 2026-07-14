import { ClaimStatus } from '@prisma/client';
import { prisma } from '../config';
import { getSkipTake } from '../utils/pagination.util';

export interface MonthlySummaryRow {
  month: string;
  totalClaimed: number;
  totalApproved: number;
  claimCount: number;
  approvedCount: number;
}

export interface MonthlySummaryParams {
  page: number;
  limit: number;
  year?: number;
}

export class AdminRepository {
  async getMonthlySummary(params: MonthlySummaryParams): Promise<{
    summaries: MonthlySummaryRow[];
    total: number;
  }> {
    const { skip, take } = getSkipTake(params.page, params.limit);

    if (params.year) {
      const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM (
          SELECT TO_CHAR(expense_date, 'YYYY-MM') AS month
          FROM claims
          WHERE EXTRACT(YEAR FROM expense_date) = ${params.year}
          GROUP BY TO_CHAR(expense_date, 'YYYY-MM')
        ) AS months
      `;

      const summaries = await prisma.$queryRaw<MonthlySummaryRow[]>`
        SELECT
          TO_CHAR(expense_date, 'YYYY-MM') AS month,
          COALESCE(SUM(amount), 0)::float AS "totalClaimed",
          COALESCE(SUM(CASE WHEN status = ${ClaimStatus.APPROVED}::"ClaimStatus" THEN amount ELSE 0 END), 0)::float AS "totalApproved",
          COUNT(*)::int AS "claimCount",
          COUNT(CASE WHEN status = ${ClaimStatus.APPROVED}::"ClaimStatus" THEN 1 END)::int AS "approvedCount"
        FROM claims
        WHERE EXTRACT(YEAR FROM expense_date) = ${params.year}
        GROUP BY TO_CHAR(expense_date, 'YYYY-MM')
        ORDER BY month DESC
        OFFSET ${skip}
        LIMIT ${take}
      `;

      return { summaries, total: Number(countResult[0]?.count ?? 0) };
    }

    const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT TO_CHAR(expense_date, 'YYYY-MM') AS month
        FROM claims
        GROUP BY TO_CHAR(expense_date, 'YYYY-MM')
      ) AS months
    `;

    const summaries = await prisma.$queryRaw<MonthlySummaryRow[]>`
      SELECT
        TO_CHAR(expense_date, 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0)::float AS "totalClaimed",
        COALESCE(SUM(CASE WHEN status = ${ClaimStatus.APPROVED}::"ClaimStatus" THEN amount ELSE 0 END), 0)::float AS "totalApproved",
        COUNT(*)::int AS "claimCount",
        COUNT(CASE WHEN status = ${ClaimStatus.APPROVED}::"ClaimStatus" THEN 1 END)::int AS "approvedCount"
      FROM claims
      GROUP BY TO_CHAR(expense_date, 'YYYY-MM')
      ORDER BY month DESC
      OFFSET ${skip}
      LIMIT ${take}
    `;

    return { summaries, total: Number(countResult[0]?.count ?? 0) };
  }
}

export const adminRepository = new AdminRepository();
