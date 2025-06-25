const express=require('express');
const cors=require('cors')
require('dotenv').config();
const app=express()
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
       const result = await serviceCollection.find().toArray();
        res.send(result); 
    })

      
    app.get('/services/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)};
        const result = await serviceCollection.findOne(query);
        res.send(result);
    })

      app.get('/booking', async (req, res) => {
        const email=req.query.email;
          const query={
        applicant:email
      }
          const result = await bookingCollection.find().toArray();
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

    app.delete('/booking/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await bookingCollection.deleteOne(query);
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