const Workspace = require('../models/Workspace');
const User = require('../models/User');

const getWorkspaces = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find workspaces where user is the patient OR user is a member
        const workspaces = await Workspace.find({
            $or: [
                { patient: userId },
                { 'members.user': userId, 'members.status': 'active' }
            ]
        })
        .populate('patient', 'name email photo')
        .populate('members.user', 'name email photo');

        res.status(200).json({ success: true, data: workspaces });
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const inviteCaregiver = async (req, res) => {
    try {
        const { email, role } = req.body;
        const patientId = req.user._id;

        const caregiver = await User.findOne({ email: email.toLowerCase() });
        if (!caregiver) {
            return res.status(404).json({ success: false, message: 'User not found. They must sign up first.' });
        }

        if (caregiver._id.toString() === patientId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot invite yourself.' });
        }

        let workspace = await Workspace.findOne({ patient: patientId });
        if (!workspace) {
            workspace = await Workspace.create({ patient: patientId, members: [] });
        }

        // Check if already a member
        const isMember = workspace.members.find(m => m.user.toString() === caregiver._id.toString());
        if (isMember) {
            return res.status(400).json({ success: false, message: 'User is already a member or invited.' });
        }

        workspace.members.push({
            user: caregiver._id,
            role: role || 'caregiver',
            status: 'active' // For simplicity in this implementation, auto-accept
        });

        await workspace.save();

        res.status(200).json({ success: true, message: 'Caregiver added successfully.', data: workspace });
    } catch (error) {
        console.error("Error inviting caregiver:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getWorkspaces,
    inviteCaregiver
};
