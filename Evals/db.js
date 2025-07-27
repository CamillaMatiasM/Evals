/**
 * Retrieves an evaluation from the database by evalId
 * @param {string} evalId - The evaluation ID to retrieve
 * @returns {Promise<Object|null>} - The evaluation record or null if not found
 */


export async function getEval(evalId) {
    try {
      const evaluation = await prisma.eval.findUnique({
        where: { evalId }
      });
      return evaluation;
    } catch (error) {
      console.error('Error retrieving evaluation:', error.message);
      return null;
    }
  }
  
  /**
   * Lists all evaluations with optional filtering
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status
   * @param {string} filters.type - Filter by type
   * @param {number} filters.limit - Limit number of results (default: 10)
   * @returns {Promise<Array>} - Array of evaluation records
   */
  export async function listEvals(filters = {}) {
    try {
      const { status, type, limit = 10 } = filters;
      
      const whereClause = {};
      if (status) whereClause.status = status;
      if (type) whereClause.type = type;
  
      const evals = await prisma.eval.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit
      });
  
      return evals;
    } catch (error) {
      console.error('Error listing evaluations:', error.message);
      return [];
    }
  } 