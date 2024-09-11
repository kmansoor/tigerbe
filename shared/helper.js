const parentFromRequest = (req) => {
  const parent = {};

  parent['name'] = req.body.name;
  parent['email'] = req.body.email;
  parent['phone'] = req.body.phone;
  parent['password'] = req.body.password;
  parent['children'] = [];

  req.body.children.forEach(child => {
    parent['children'].push(child);
  })

  return parent;
};

const isParentInvalid = (parent) => {
  const err = [];
  if (!parent.name || parent.name.trim() === '') {
    err.push('Name is empty');
  }
  if (!parent.email || parent.email.trim() === '') {
    err.push('Email is empty');
  }
  if (!parent.phone || parent.phone.trim() === '') {
    err.push('Phone is empty');
  }
  if (!parent.password || parent.password.trim() === '') {
    err.push('Password is empty');
  }
  if (!parent.children || parent.children.length === 0) {
    err.push('No child added');
  } else {
    parent.children.forEach(child => {
      if (!child.name || child.name.trim() === '') {
        err.push('Child\'s Name is empty');
      }
      if (!child.grade || child.grade.trim() === '') {
        err.push('Child\'s Grade is empty');
      }
      if (!child.section || child.section.trim() === '') {
        err.push('Child\'s Section is empty');
      }
    });
  }

  return err.length > 0 ? err.join(', ') : null;
};

const staffFromRequest = (req) => {
  const staff = {};

  staff['name'] = req.body.name;
  staff['email'] = req.body.email;
  staff['phone'] = req.body.phone;
  staff['password'] = req.body.password;

  return staff;
};

const isStaffInvalid = (staff) => {
  const err = [];
  if (!staff.name || staff.name.trim() === '') {
    err.push('Name is empty');
  }
  if (!staff.email || staff.email.trim() === '') {
    err.push('Email is empty');
  }
  if (!staff.phone || staff.phone.trim() === '') {
    err.push('Phone is empty');
  }
  if (!staff.password || staff.password.trim() === '') {
    err.push('Password is empty');
  } else if (staff.password.trim() !== 'J7WM@OG$') {
    err.push('Password is invalid');
  }

  return err.length > 0 ? err.join(', ') : null;
};

const toParentChildObjectStructure = (rows) => {
  const parents = [];
  let parent = {};

  rows.forEach((row, index) => {
    if (parent['uuid'] !== row.parent_uuid) {

      if (index > 0) {
        parents.push(parent);
        parent = {};
      }

      parent['name'] = row.name;
      parent['email'] = row.email;
      parent['phone'] = row.phone;
      parent['uuid'] = row.parent_uuid;
      parent['created_on'] = row.created_on;

      parent['children'] = [];

      parent.children.push({
        name: row.child_name,
        grade: row.grade,
        section: row.section
      });
    } else {
      parent.children.push({
        name: row.child_name,
        grade: row.grade,
        section: row.section
      });
    }
  });

  if(parent['uuid']) {
    parents.push(parent);
  }
  return parents;
}

const toParentLocationObjectStructure = (rows) => {
  const parents = [];
  let parent = {};

  rows.forEach((row, index) => {
    if (parent['parentUuid'] !== row.parent_uuid) {

      if (index > 0) {
        parents.push(parent);
        parent = {};
      }

      parent['parentName'] = row.parent_name;
      parent['parentUuid'] = row.parent_uuid;
      parent['latLng'] = {latitude: row.latitude, longitude: row.longitude};

      parent['children'] = [];

      parent.children.push({
        name: row.child_name,
        grade: row.grade,
        section: row.section,
        campus: row.campus_id
      });
    } else {
      parent.children.push({
        name: row.child_name,
        grade: row.grade,
        section: row.section,
        campus: row.campus_id
      });
    }
  });

  if(parent['parentUuid']) {
    parents.push(parent);
  }
  return parents;
}

module.exports = {
  parentFromRequest,
  isParentInvalid,
  staffFromRequest,
  isStaffInvalid,
  toParentChildObjectStructure,
  toParentLocationObjectStructure
}