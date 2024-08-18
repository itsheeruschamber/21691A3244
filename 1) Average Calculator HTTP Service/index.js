const express=require('express');
const axios=require('axios');

const app=express();
const PORT=8008;

app.get('/numbers',async(req,res)=> {
  try {
    const { url }=req.query;

    if (!Array.isArray(url)) {
      url=["http://20.244.56.144/numbers/primes", "http://20.244.56.144/numbers/fibo", "http://20.244.56.144/numbers/odd","http://20.244.56.144/numbers/rand"];
    }

    const numbers=[];

    const requests=url.map(async(url)=>{
      try {
        const response=await axios.get(url);
        const {numbers:urlNumbers}=response.data;
        numbers.push(...urlNumbers);
      } catch (error) {
        console.error(`Error retrieving numbers from ${url}:${error.message}`);
      }
    });

    await Promise.all(requests);
    const mergedNumbers=Array.from(new Set(numbers)).sort((a,b)=>a-b);

    res.json({numbers:mergedNumbers});
  } catch(error) {
    console.error(`Error processing request:${error.message}`);
    res.status(500).json({error:'Server error'});
  }
});

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});