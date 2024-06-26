const Team = require('@/models/Team');

const paginatedList = async (Model, req, res) => {
  try {
    const user = req.user;
    const instituteName = req.query.instituteName;
    const universityName = req.query.universityName;

    let query = { removed: false };

    if (instituteName) {
      query['customfields.institute_name'] = instituteName;
    }
    if (universityName) {
      query['customfields.university_name'] = universityName;
    }

    if (user.role === 'manager') {
      let team = await Team.findOne({ userId: user._id }).populate('teamMembers');

      if (team) {
        query['customfields.institute_name'] = { $in: team.institute }   
        query['customfields.university_name'] = { $in: team.university }   
        query['university_name'] = { $in: team.university }   
        query['institute_name'] = { $in: team.institute }      
               } 
    } else if (user.role === 'supportiveassociate') {
      let team = await Team.findOne({ userId: user._id }).populate('teamMembers');

      if (team) {
        const teamMemberIds = team.teamMembers.map(member => member._id);
        query.userId = { $in: [user._id, ...teamMemberIds] };
        query['customfields.institute_name'] = { $in: team.institute };
        query['customfields.university_name'] = { $in: team.university }; 
        query['institute_name'] = { $in: team.institute }; 
        query['university_name'] = { $in: team.university };
      }
    } else if (user.role === 'teamleader') {
      const team = await Team.findOne({ userId: user._id }).populate('teamMembers');

      if (team) {
        const teamMemberIds = team.teamMembers.map(member => member._id);
        query.userId = { $in: [user._id, ...teamMemberIds] };

        if (instituteName) {
          query['customfields.institute_name'] = instituteName;
        }
      }
    } else if (user.role === 'admin' || user.role === 'subadmin') {
      // Admin and subadmin get all data, no need to modify the query
    } else {
      query.userId = user._id;
    }

    const resultsPromise = Model.find(query)
      .sort({ created: 'desc' })
      .populate('userId')
    const countPromise = Model.countDocuments(query);

    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    if (count > 0) {
      const formattedResults = result.map((item) => ({
        ...item._doc,
        date: item.date ? new Date(item.date).toLocaleDateString('en-US') : null,
        time: item.time,
      }));

      return res.status(200).json({
        success: true,
        result: formattedResults,
        count,
        message: 'Successfully found all documents',
      });
    } else {
      return res.status(200).json({
        success: true,
        result: [],
        count: 0,
        message: 'No data found for the specified criteria',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: [],
      message: error.message,
      error: error,
    });
  }
};

module.exports = paginatedList;
