const Employee = require('../models/Employee');

// @desc    Get all employees for admin management
// @route   GET /api/admin/employees
// @access  Private/Admin
exports.getEmployees = async (req, res) => {
  try {
    console.log("📡 Admin employee fetch triggered");
    
    // Fetch all registered employees from the Employee collection
    const employees = await Employee.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('❌ Error in getEmployees controller:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};
