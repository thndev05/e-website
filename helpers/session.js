const User = require('../models/user.model');

const updateSessionUser = async (req, id) => {
    try {
        const updatedUser = await User.findById(id).lean();

        req.session.user = {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          birthdate: updatedUser.birthdate,
          address: updatedUser.address,
        };
    } catch (error) {
        console.error('Error updating session user:', error);
    }
};

module.exports = updateSessionUser;