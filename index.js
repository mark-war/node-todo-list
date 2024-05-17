import express from 'express'
import fs from 'fs'
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))

//API health check
app.get('/', (request, response) => {
    return response.send('Application running!')
})

// GET API /todos
app.get('/todos', (request, response) => {
    //for filtering the list
    const showPendingOnly = request.query.showPendingOnly
    fs.readFile('./store/todos.json', 'utf-8', (error, data) => {
        if (error) {
            return response.status(500).send('Ooops, something went wrong.')
        }

        const todos = JSON.parse(data)
        if (showPendingOnly !== '1') {
            return response.json({todos: todos})
        } else {
            return response.json({todos: todos.filter(t => {return t.completed === false})})
        }        
    })
})

// PUT API /todos/:1/completed
app.put('/todos/:id/completed', (request, response) => {
    const id = request.params.id

    //mark todo as completed by id
    const updateTodoById = (todos, id) => {
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id === parseInt(id)) {
                todos[i].completed = true
                return todos[i]
            }
        }
        return response.status(404).send('Id not found in the list.') 
    }

    //get all todos
    fs.readFile('./store/todos.json', 'utf-8', (error, data) => {
        if (error) {
            return response.status(500).send('Ooops, something went wrong.')
        }

        let todos = JSON.parse(data)
        todos[id-1] = updateTodoById(todos, id)
        

        fs.writeFile('./store/todos.json', JSON.stringify(todos), () => {
            return response.json({status: 'OK'})
        })
    })
})

//POST API /todo
app.post('/todo', (request, response) => {
    if (!request.body.todo) {
        return response.status(400).send('Missing Required Field')
    }
    fs.readFile('./store/todos.json', 'utf-8', (error, data) => {
        if (error) {
            return response.status(500).send('Ooops, something went wrong.')
        }

        const todos = JSON.parse(data)
        const maxId = Math.max.apply(Math, todos.map(t => {return t.id}))

        todos.push({
            id: maxId + 1,
            todo: request.body.todo,
            completed: false,
            userid: 0
        })

        fs.writeFile('./store/todos.json', JSON.stringify(todos), () => {
            return response.json({status: 'OK'})
        })
    })
})

app.listen(PORT, () => {
    console.log(`Application running on http://localhost:${PORT}`)
})