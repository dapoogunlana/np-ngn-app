import express from 'express';
const fetch = require('node-fetch');

const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const name = req.query?.visitor_name;
        const ip = `${(req.headers['x-forwarded-for'] || '')}`.split(',')[0].trim() || 
        req.socket.remoteAddress;
        if(!name) {
            return res.status(400).json({
                success: false,
                message: 'visitor name is missing'
            })
        }
        const locationRes = await fetch(`https://ipfind.co/?ip=${ip}&auth=${process.env.IPFIND_API_KEY}`);
        const location: any = await locationRes.json();
        const wheaterRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location?.longitude}&lon=${location?.longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}`);
        const wheater: any = await wheaterRes.json();
        const temp = (wheater?.main?.temp || wheater?.main?.temp === 0) ? `${(wheater.main.temp - 273.15).toFixed(1)} degrees Celcius` : 'temporarily unavailable';
        return res.json({
            "client_ip": ip, 
            "location": location?.city,
            "greeting": `Hello, ${name}!, the temperature is ${temp} in ${location?.city}`
        })
    }
    catch(e){
        return res.status(500).json({
            success: false,
            message: e
        })
    }
});

export default router;