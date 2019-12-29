import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';




const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-grafica-1f3c9.firebaseio.com"
  });


  const db=admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
 export const helloWorld = functions.https.onRequest((request, response) => {
 response.json(
     {mensaje:"Hola mundo desde el backend 4!"});
 });


 export const getGoty = functions.https.onRequest(async(request, response) => {


    //const nombre=request.query.nombre||'sin nombre';
    const gotyRef=db.collection('goty');
    const docsSnap=await gotyRef.get();
    const juegos=docsSnap.docs.map(doc=>doc.data());
    response.json(juegos);

 });



 const app=express();
 app.use( cors({
     origin:true
 }));

 app.get('/goty',async(req,res)=>{
    const gotyRef=db.collection('goty');
    const docsSnap=await gotyRef.get();
    const juegos=docsSnap.docs.map(doc=>doc.data());
    res.json(juegos);
 });
 app.post('/goty',async(req,res)=>{
     const name=req.body.name;
     const id=name.replace(" ","-");
      const data={
        
            'id':id,
            'name':name,
            'url':req.body.url,
            'votos':0
     }; 
     await db.collection('goty').doc(id).set(data);
    
     res.send(data);
    
 });


 app.post('/goty/:id',async(req,res)=>{
    const id=req.params.id;
    const gameRef=db.collection('goty').doc(id);
    const gameSnap=await gameRef.get();

   if(!gameSnap.exists){
       res.status(404).json({
           ok:false,
           mensaje:'no existe un juego con ese ID: '+id
       });
   }else{
       const antes=gameSnap.data()||{votos:0};
    //res.json('juegos existe');
    await gameRef.update({
        votos:antes.votos+1
    });
    res.json({
        ok:true,
        mensaje:`Gracias por tu voto ${antes.name}`
    })
   }
    
 });




 exports.api=functions.https.onRequest(app);
 
