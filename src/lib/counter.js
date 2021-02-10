self.onmessage = function(event) {
    console.log(`in web worker data = ${event.data}`);
    setInterval(() => {
        self.postMessage('1111')
    },1000)
    // setInterval(async () => {
    //     const memUsed = await process.getProcessMemoryInfo();
    //     self.postMessage(memUsed);
    //     // self.postMessage('1111');
    // },1000)
}