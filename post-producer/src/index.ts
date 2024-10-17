import { Hono } from 'hono'

import { init } from './config/start.services'

import postRoute from './services/create-post';

const app = new Hono()

init();

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/', postRoute)

export default { 
  port: 4000, 
  fetch: app.fetch, 
} 
