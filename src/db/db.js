const users = [
  {
    id: "1",
    name: "Abanoub",
    email: "aop4ever@gmail.com",
    age: 26
  },
  {
    id: "2",
    name: "Mena",
    email: "profmon062@gmail.com",
    age: 24
  },
  {
    id: "3",
    name: "Yousteena",
    email: "yousteena-teen@gmail.com",
  }
]

const posts = [
  {
    id: "post1",
    title: "New Plan",
    body: "I have put a plan for 9 month of career development",
    published: true,
    author: "1"
  },
  {
    id: "post2",
    title: "New Job",
    body: "I have a new job as Back-end engineer at Rescounts",
    published: true,
    author: "1"
  },
  {
    id: "post3",
    title: "Teacher",
    body: "I have new job as french teacher at FGIS",
    published: false,
    author: "2"
  },
  {
    id: "post4",
    title: "Secondary school",
    body: "I went to new school El shimaa",
    published: true,
    author: "3"
  }
]

const comments = [
  {
    id: "c01",
    text: "Good Keep learning to become a good developer",
    author: "2",
    post: "post1",
  },
  {
    id: "c02",
    text: "Bravo, my brother",
    author: "3",
    post: "post1",
  },
  {
    id: "c03",
    text: "Congratulations, from your brother Abanoub",
    author: "1",
    post: "post3",
  },
  {
    id: "c04",
    text: "Congratulations, from your sister Yousteena",
    author: "3",
    post: "post3",
  },
  {
    id: "c05",
    text: "you will be a greate student",
    author: "1",
    post: "post4",
  }
]


const db = {
  users,
  posts,
  comments
}

export {
  db
}