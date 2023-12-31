const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5001
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rdnshyp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const serviceCollection = client.db('pestControl').collection('services')
        const bookingCollection = client.db('pestControl').collection('bookings')
        const newServiceCollection = client.db('pestControl').collection('newservices')

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { name: 1, short_description: 1, details1: 1, details2: 1, details3: 1, image1: 1, image2: 1, image3: 1, price: 1, service_provider_name: 1, service_provider_image: 1, service_provider_email: 1 }
            }
            const result = await serviceCollection.findOne(query, options)
            res.send(result)
        })

        // booking//

        app.get('/bookings', async (req, res) => {
            console.log(req.query.userEmail)
            let query = {}
            if (req.query?.userEmail){
                query = {userEmail: req.query.userEmail}
            }
            const cursor = bookingCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        

        app.post('/bookings', async (req, res) => {
            const booking = req.body
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })

        // new service //
        app.get('/newservices', async (req, res)=>{
            
            let query = {}
            if (req.query?.user_email){
                query = {user_email: req.query.user_email}
            }
            const result = await newServiceCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/newservices/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await newServiceCollection.findOne(query)
            res.send(result)
        })


        app.post('/newservices', async(req, res) =>{
            const newServices =req.body
            
            const result = await newServiceCollection.insertOne(newServices)
            res.send(result)
        })

        app.put('/newservices/:id', async(req, res) =>{
            const id = req.params.id
            const filter = {_id: new ObjectId(id)}
            const options = {upsert: true}
            const updatedService = req.body
            const service ={
                $set: {
                    
                    serviceName: updatedService.serviceName,
                    price: updatedService.price,
                    userName: updatedService.userName,
                    user_email: updatedService.user_email,
                    photo_url: updatedService.photo_url,
                    description: updatedService.description,
                    location: updatedService.location
                }
            }
            const result = await newServiceCollection.updateOne(filter, service, options)
            res.send(result)
        })

        app.delete('/newservices/:id', async (req, res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await newServiceCollection.deleteOne(query)
            res.send(result)
        })

        
       
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Pest Control server is running')
})

app.listen(port, () => {
    console.log(`Pest Control server is running on port ${port}`)
})