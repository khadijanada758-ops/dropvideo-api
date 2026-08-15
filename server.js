const express=require("express");
const cors=require("cors");
const {spawn}=require("child_process");
const app=express();
app.use(cors({origin:"*"}));
app.use(express.json({limit:"64kb"}));
const PORT=process.env.PORT||10000;
const YTDLP=process.env.YTDLP_PATH||"yt-dlp";

function validUrl(v){try{const u=new URL(v);return ["http:","https:"].includes(u.protocol)}catch{return false}}

function run(args){return new Promise((resolve,reject)=>{
  const p=spawn(YTDLP,args,{stdio:["ignore","pipe","pipe"]});
  let out="",err="";
  p.stdout.on("data",d=>out+=d);
  p.stderr.on("data",d=>err+=d);
  p.on("error",reject);
  p.on("close",c=>c===0?resolve(out):reject(new Error(err||"yt-dlp failed")));
})}

app.get("/",(_,r)=>r.json({ok:true,name:"DropVideo API"}));
app.get("/api/health",(_,r)=>r.json({ok:true}));

app.post("/api/info",async(req,res)=>{
  const url=req.body?.url;
  if(!validUrl(url)) return res.status(400).json({ok:false,error:"Invalid URL"});
  try{
    const raw=await run(["--dump-single-json","--no-playlist","--skip-download",url]);
    const d=JSON.parse(raw);
    res.json({ok:true,title:d.title||"Video",thumbnail:d.thumbnail||null,
      duration:d.duration||null,uploader:d.uploader||null,
      formats:(d.formats||[]).filter(f=>f.url&&(f.vcodec!=="none"||f.acodec!=="none")).slice(-40)
      .map(f=>({format_id:f.format_id,ext:f.ext,resolution:f.resolution||null,height:f.height||null,
        fps:f.fps||null,acodec:f.acodec||null,vcodec:f.vcodec||null,
        filesize:f.filesize||f.filesize_approx||null}))});
  }catch(e){res.status(500).json({ok:false,error:"Could not analyze this URL"})}
});

app.get("/api/download",async(req,res)=>{
  const url=req.query.url, format=req.query.format||"bestvideo*+bestaudio/best";
  if(!validUrl(url)) return res.status(400).json({ok:false,error:"Invalid URL"});
  res.setHeader("Content-Disposition",'attachment; filename="dropvideo.mp4"');
  res.setHeader("Content-Type","video/mp4");
  const p=spawn(YTDLP,["--no-playlist","-f",format,"-o","-",url]);
  p.stdout.pipe(res);
  p.on("error",()=>{if(!res.headersSent)res.status(500).json({ok:false,error:"Download failed"});else res.end()});
  p.on("close",c=>{if(c!==0&&!res.headersSent)res.status(500).json({ok:false,error:"Download failed"})});
});
app.listen(PORT,"0.0.0.0",()=>console.log("DropVideo API on "+PORT));