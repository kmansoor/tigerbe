document.getElementById('create-parent')
  .addEventListener('click', evt => {
    fetch('/parent', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@email.com',
        phone: '417-987-5647',
        password: 'strong',
        children: [
          {name: 'Jane Doe', grade: '4', section: 'E'},
          {name: 'Jake Doe', grade: '7', section: 'A'}
        ]
      })
    })
    .then(res => res.json())
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err);
    });
  });