module.exports.requestLoggerMiddleware = function(req, res, next){
    // console.info(`${req.method}, ${req.originalUrl}`);
    const start = new Date().getTime();
    
    res.on('finish', ()=>{
        const elapsed = new Date().getTime() - start;
        console.info(`method: ${req.method}, url: ${req.originalUrl}, code: ${res.statusCode}, time: ${elapsed}ms`)  
    })
    next();
}