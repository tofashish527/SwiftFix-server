const express=require('express');
const cors=require('cors')
require('dotenv').config();
const app=express()
const jwt=require('jsonwebtoken')
const port=process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.3b76qlc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

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
    await client.connect();

    const serviceCollection=client.db('SwiftFixDB').collection('services');
    const bookingCollection=client.db('SwiftFixDB').collection('booking');

      app.get('/services',async(req,res)=>{
             const email=req.query.email;
        const query={}
        if(email)
        {
          query.providerEmail=email;
        }
       const result = await serviceCollection.find(query).toArray();
        res.send(result); 
    })

      
    app.get('/services/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)};
        const result = await serviceCollection.findOne(query);
        res.send(result);
    })


    app.get('/booking/provider', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }

  const services = await serviceCollection.find({ providerEmail: email }).toArray();
  const serviceIds = services.map(svc => svc._id.toString());

  const bookings = await bookingCollection
    .find({ serviceId: { $in: serviceIds } })
    .toArray();

  res.send(bookings);
});


     app.post('/services',async(req,res)=>{
        const newJob=req.body;
        console.log(newJob);
        const result=await serviceCollection.insertOne(newJob);
        res.send(result)
    })

    app.put('/services/:id', async (req, res) => {
  const id = req.params.id;
  const updatedService = req.body;

  const result = await serviceCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedService }
  );

  res.send(result);
});

     app.get('/booking', async (req, res) => {
        const email=req.query.email;
          const query={
        userEmail:email
      }
          const result = await bookingCollection.find(query).toArray();
           //bad way to aggregate data
      for(const svc of result)
      {
        const svcId=svc.serviceId;
        const svcQuery={_id:new ObjectId(svcId)}
        const service=await serviceCollection.findOne(svcQuery);
        svc.serviceName=service.serviceName;
        svc.providerName=service.providerName;
        svc.price=service.servicePrice;
      }
          res.send(result);
      });

      app.post('/booking',async(req,res)=>{
        const booking=req.body;
        const result=await bookingCollection.insertOne(booking);
        res.send(result);
    })

 app.patch('/booking/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)}
      const updatedDoc={
        $set:{
          serviceStatus:req.body.status
        }
      }
      const result=await bookingCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })

    app.delete('/services/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await serviceCollection.deleteOne(query);
  res.send(result);
});


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('SwiftFix is getting started!!!')
});

app.listen(port,()=>{
    console.log(`SwiftFix is running on the port ${port}`)
});