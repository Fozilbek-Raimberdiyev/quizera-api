(()=>{var e={872:(e,t,s)=>{const a=s(344);s(432),e.exports=async function(e,t,s){const r=e.headers.authorization;if(!r)return t.status(401).json({message:"Unauthorized"});try{const t=a.verify(r,process.env.JSON_SIGNATURE);e.user=t,s()}catch(e){return t.status(401).json({message:"Unauthorized"})}}},584:(e,t,s)=>{const a=s(185),{Schema:r,model:n}=a,i=n("permissions",new r({name:{type:String,required:!0},actions:{type:[String],default:[]}}));e.exports=i},53:(e,t,s)=>{const{Router:a}=s(860),{questionController:r,Question:n}=s(865),{subjectController:i,Subject:o}=s(177),{Todo:u}=s(473),{User:d}=s(332),{resultController:l}=s(590),c=s(872),m=a();m.use(s(986).json()),m.use(s(582)({origin:"*"})),m.get("/",c,(async(e,t)=>{const s=e.user.userID,a=await d.findById(s);let r=await u.find({authorId:s});const n=r.filter((e=>!e.isMaked&&new Date(new Date(e.endDate)-new Date).getDate()<=3&&new Date(new Date(e.endDate)-new Date).getFullYear()>=1970));r.forEach((async e=>{if(!e.isMaked&&new Date(new Date(e.endDate)-new Date).getFullYear()<1970&&!e.isLated)return e.isLated=!0,u.findByIdAndUpdate(e._id,e,{new:!0},((e,t)=>{e&&console.log({message:"Error finding todo"}),t||console.log({message:"Todo not found"}),console.log({message:"Todo succesfully updated"})}))})),t.status(200).send({todos:n,user:a})})),m.use("/todos",s(473).router),m.use("/auth",s(887)),m.use("/permissions",s(793)),m.use("/subjects",i),m.use("/questions",r),m.use("/users",s(332).router),m.use("/results",l),m.use("/events",s(761)),m.use("/listeningQuiz",s(468)),e.exports=m},761:(e,t,s)=>{const a=s(860).Router(),r=(s(986),s(506)),n=s(185),i=(s(738)({}),s(455),new n.Schema({authorId:String,authorFullName:String,events:[Object]})),o=r.object({authorId:r.string(),authorFullName:r.string(),events:r.array().required()}),u=n.model("latetimespray",i);a.get("/",(async(e,t)=>{let s=await u.find();return t.status(200).send({message:"message",events:s})})),a.post("/add",(async(e,t)=>{const{error:s,value:a}=o.validate(e.body);return s?t.status(400).send({message:"Bad request"}):(await u.insertMany(a),t.status(201).send({message:"Muvaffaqqiyatli qo'shildi"}))})),e.exports=a},468:(e,t,s)=>{const{Router:a}=s(860),r=a(),n=s(738),i=s(185),o=s(872),u=s(506),d=s(432);function l(e){let t={correctWordsCount:0,inCorrectWordsCount:0,notFilledWords:0};for(let s of e)s.isVisible&&s.value.toLocaleLowerCase()===s.label.toLocaleLowerCase()?t.correctWordsCount++:s.isSelected&&!s.isVisible&&s.value.toLocaleLowerCase()!=s.label.toLocaleLowerCase()?t.inCorrectWordsCount++:s.isSelected||t.notFilledWords++;return t}const c=n.diskStorage({destination:function(e,t,s){s(null,"public/uploads/listening/")},filename:function(e,t,s){s(null,t.originalname)}}),m=n({storage:c}),g=new i.Schema({name:String,time:Number,text:String,textArray:[Object],members:[Object],authorId:String,authorFullName:String,createdDate:{type:Number,default:(new Date).getTime()},isForAll:Boolean,isStarted:{type:Boolean,default:!1},password:String,isHasPassword:Boolean,authorPathImage:String,audioPath:String}),p=u.object({name:u.string().min(4).max(50).required(),text:u.string().required(),textArray:u.array().required(),time:u.number().required(),members:u.array().required(),authorId:u.string().required(),authorPathImage:u.string(),authorFullName:u.string(),createdDate:u.number(),isForAll:u.boolean(),isStarted:u.boolean().required(),password:u.string(),isHasPassword:u.boolean().required(),audioPath:u.string().required()});g.pre("save",(function(e){const t=this;if(!t.isModified("password"))return e();d.hash(t.password,10,(function(s,a){if(s)return e(s);t.password=a,e()}))}));const f=i.model("listeningquizzes",g);r.get("/",o,(async(e,t)=>{let s=e.query.page||1,a=e.query.limit||10;if(!0===e.query.isForReference)try{f.find({authorId:e.user.userID}).skip((s-1)*a).limit(a).exec(((e,s)=>{if(!e)return t.status(200).send({quizzes:s,total:s.length})}))}catch(e){console.log(e)}else f.find({$or:[{members:{$elemMatch:{value:e.user.email}},isStarted:!0},{authorId:e.user.userID},{isForAll:!0,isStarted:!0}]}).skip((s-1)*a).limit(a).exec((function(e,s){if(!e)return t.status(200).send({quizzes:s,total:s.length})}))})),r.post("/add",m.single("audio"),o,(async(e,t)=>{const s=e.file;let a=JSON.parse(e.body.form);null==s&&null==s||(a.audioPath=process.env.HOST+s.path);const{error:r,value:n}=p.validate(a);if(r)return t.status(400).send({message:r.details[0].message});try{let e=await f(n),s=(await e.save(),await f.find()),a=await f.find().countDocuments();return t.status(200).send({message:"Muvaffaqqiyatli",quizs:s,total:a})}catch(e){}})),r.get("/:id",(async(e,t)=>{let s=e.params.id;if("undefined"===s||"null"===s)return t.status(400).send({message:"Fan identifikatori topilmadi..."});let a=await f.findById(s);return a?(a.password=void 0,t.status(200).send(a)):t.status(404).json({message:"Sinov topilmadi"})})),r.put("/update",m.single("audio"),o,(async(e,t)=>{let s=JSON.parse(e.body.form),a=e.file;null==a&&null==a||(s.audioPath=process.env.HOST+a.path);const{error:r,value:n}=p.validate(s);if(r)return t.status(400).json({message:r.details[0].message});d.hash(n.password,10,((s,a)=>{if(s&&n.isHasPassword)return t.status(400).send({message:"Parolni saqlashda xatolik!"});n.password=a,f.findByIdAndUpdate(e.query.ID,n,{new:!0},((e,s)=>e?t.status(500).json({message:"Error finding quiz"}):s?t.json({message:"Quiz succesfully updated"}):t.status(404).json({message:"Quiz not found"})))}))})),r.put("/statusUpdate",o,(async(e,t)=>{const{status:s,quiz:a}=e.body,r=await f.updateOne({_id:a},{$set:{isStarted:s}}),n=await f.find({authorId:e.user.userID});return t.status(200).send({message:"Muvaffaqqiyatli",updated:r,quizzes:n})})),r.delete("/delete",(async(e,t)=>{let s=e.query.ID;try{f.findByIdAndRemove(s,((e,s)=>e?t.status(500).json({message:"Error deleting quiz"}):s?t.json({message:"Quiz deleted."}):t.status(404).json({message:"Quiz not found"})))}catch(e){console.error(e),t.status(500).send("Internal server error")}})),r.post("/checkPassword",o,(async(e,t)=>{const{quizID:s,password:a}=e.body,r=await f.findById(s);return await d.compare(a,r.password)?t.status(200).send({isAllowed:!0}):t.status(400).send({message:"Parol xato kiritildi..."})})),r.post("/check",o,(async(e,t)=>{let s=e.body,a=function(e){for(let t of e)t.isVisible||t.value.toLocaleLowerCase()!==t.label.toLocaleLowerCase()||(t.isCorrectFilled=!0),t.isSelected=!0;return e}(s);return t.status(200).send({result:a,stat:l(s)})})),e.exports=r},793:(e,t,s)=>{const{Router:a}=s(860),r=a(),n=s(584),i=s(872);r.get("/",i,(async(e,t)=>{let s=await n.find();t.status(200).json({permissions:s})})),r.post("/add",i,(async(e,t)=>{let s=e.body;if(!s)return t.status(400).json({message:"Bad request"});let a=new n(s);await a.save(),t.status(201).json({message:"Succesfully added"})})),e.exports=r},865:(e,t,s)=>{const a=s(860).Router(),r=s(185),n=s(506),i=s(872),{query:o}=(s(860),s(860)),{json:u}=s(986),{User:d}=s(332),{Result:l}=s(590);let c=(new Date).getTime();function m(e){for(var t=e.length-1;t>0;t--){var s=Math.floor(Math.random()*(t+1)),a=e[t];e[t]=e[s],e[s]=a}return e}function g(e,t){let s={};for(element of e)if(element.ball===t&&!element.isHas)return s=element,element.isHas=!0,s;return s}function p(e){let t=0;for(let s of e)if(s.isChecked)for(let e of s.options)e.isSelected&&e.isTrue&&(t+=s.ball);return t}function f(e){let t=0;for(let s of e)s.isCorrectSelected,s?.isCorrectSelected&&s.isChecked&&t++;return t}function y(e){let t=0;for(let s of e)!s.hasOwnProperty("isCorrectSelected")&&s.isChecked&&t++;return t}function b(e){let t=0;for(let s of e)s.isChecked,s.isChecked||t++;return t}a.use(u(o));const w=new r.Schema({question:String,ball:Number,isHas:Boolean,options:[Object],subjectId:String,isChecked:{type:Boolean,default:!1},timeStamp:{type:String,default:c}}),h=n.object().keys({options:n.array().items(n.object({optionLabel:n.required(),isTrue:n.boolean().required(),placeholder:n.any(),lastSelectNumber:n.number(),isSelected:n.boolean()})),question:n.any().required(),ball:n.number(),isHas:n.boolean().required(),subjectId:n.any().required()}),q=r.model("questions",w);a.post("/",(async(e,t)=>{let{subjectId:s,limit:a,page:r}=e.query,n=e.body;if(0===Object.keys(e.body).length&&"0"===a&&"0"===r)try{let e=await q.find({subjectId:s});return t.status(200).send(e)}catch(e){return t.status(400).send({message:e})}n?.grades&&n.grades.sort(((e,t)=>+e.grade-+t.grade));let i=[];const o=await q.find({subjectId:s}).skip(((r||1)-1)*(a||5)).limit(a);let u=m(o);u.forEach((e=>m(e.options)));let d=await q.find({subjectId:s}).countDocuments();if(n.isDifferent)return n?.quizCount>u.length?t.status(200).send(u):(i=function(e){let t=[],s=0;return e.forEach((e=>{for(let a=0;a<+e.count;a++)t[s+a]=g(u,+e.grade);s+=+e.count})),t}(n.grades),t.status(200).send({questions:i}));{let s=[];if([...o].reverse(),e.query?.forReference)return t.status(200).send({total:d,questions:o});for(let e=0;e<n.quizCount;e++)s.push(u[e]);return t.status(200).send({total:d,questions:s})}})),a.post("/add",i,(async(e,t)=>{e.body.ball=e.body.ball||0;let{error:s,value:a}=h.validate(e.body);if(s)return t.status(400).json({message:s.details[0].message});const r=new q(a),n=await r.save();return t.status(201).send({savedQuestion:n,message:"Savol muvaffaqqiyatli qo'shildi"})})),a.post("/check",i,(async(e,t)=>{const s=await d.findById(e.user.userID);let a=e.body.questions,r=e.body.point,n=[];a.forEach((e=>{e.options&&e.question&&n.push(e)})),n.length!=a.length&&(a=n);for(const e of a){let t=-1/0,s=0;for(let a=0;a<e?.options?.length;a++){let r=e.options[a];r.lastSelectNumber=r.lastSelectNumber||1,r?.lastSelectNumber>t&&(t=r.lastSelectNumber,s=a)}e.isChecked?e.options[s].isSelected=!0:e.options[s].isSelected=!1}a.forEach((e=>{e.options.forEach((t=>{if(t.isSelected&&t.isTrue)return e.isCorrectSelected=!0}))}));let i=!1;if(p(a)>=60*r/100&&(i=!0),r){let n={subjectPoint:r,subjectAuthorId:e.body.subject.authorId,testerId:e.user.userID,testerImagePath:s.pathImage,status:i?"Passed":"Failed",workingDurationTime:e.body.workingDurationTime,fullName:s.firstName+" "+s.lastName,subjectId:e.body.subject?._id,subjectName:e.body.subject?.name,subjectPoint:e.body.subject.point,workingTime:(new Date).getTime(),subjectQuizTime:e.body.subject.time,countCorrectAnswers:f(a),countIncorrectAnswers:y(a),countNotSelectedAnswers:e.body.subject.quizCount-f(a)-y(a),correctAnswers:a.filter((e=>e.isCorrectSelected)),incorrectAnswers:a.filter((e=>!e.isCorrectSelected&&e.isChecked)),ball:p(a),percentageResult:100*p(a)/r,questionsCount:e.body.subject.quizCount,notSelectedAnswers:a.filter((e=>!e.isChecked))},o=await l(n);return await o.save(),t.status(200).send({answers:a,sum:p(a),isPassed:i,point:r})}{let r={testerId:s.userID,testerImagePath:e.user.pathImage,status:f(a)>=60*e.body.subject.quizCount/100?"Passed":"Failed",workingDurationTime:e.body.workingDurationTime,fullName:s.firstName+" "+s.lastName,subjectId:e.body.subject?._id,subjectName:e.body.subject?.name,workingTime:(new Date).getTime(),subjectQuizTime:e.body.subject.time,countCorrectAnswers:f(a),countIncorrectAnswers:y(a),countNotSelectedAnswers:e.body.subject.quizCount-f(a)-y(a),correctAnswers:a.filter((e=>e.isCorrectSelected)),incorrectAnswers:a.filter((e=>!e.isCorrectSelected&&e.isChecked)),ball:p(a),questionsCount:e.body.subject.quizCount,notSelectedAnswers:a.filter((e=>!e.isChecked)),percentageResult:100*f(a)/e.body.subject.quizCount},n=await l(r);return await n.save(),t.status(200).send({answers:a,correctAnswersCount:f(a),inCorrectAnswersCount:y(a),notCheckedQuestionsCount:b(a)})}})),a.get("/:id",(async(e,t)=>{let s=e.params.id;if("undefined"===s||"null"===s)return t.status(400).send({message:"Savol identifikatori topilmadi!"});let a=await q.findById(s);return a?t.status(200).send({question:a}):t.status(404).send({message:"Savol topilmadi!"})})),a.put("/update",(async(e,t)=>{let s=e.query.ID,a=e.body;q.findByIdAndUpdate(s,a,{new:!0},((e,s)=>e?t.status(500).send({message:"Savolni topishda xatolik..."}):s?t.send({message:"Savol muvaffaqqiyatli yangilandi..."}):t.status(404).send({message:"Bunaqa identifikatorli savol topilmadi..."})))})),a.delete("/delete",(async(e,t)=>{q.findByIdAndRemove(e.query.ID,((e,s)=>e?t.status(500).json({message:"Error deleting question"}):s?t.json({message:"Question succesfully deleted"}):t.status(404).json({message:"Question not found"})))})),e.exports={questionController:a,Question:q}},590:(e,t,s)=>{const a=s(872),r=s(185),n=s(860).Router(),i=new r.Schema({testerId:String,testerImagePath:String,workingTime:Date,status:String,workingDurationTime:Number,comments:[Object],fullName:String,subjectId:String,subjectAuthorId:String,subjectName:String,subjectPoint:Number,subjectQuizTime:Number,questionsCount:Number,countCorrectAnswers:Number,countIncorrectAnswers:Number,correctAnswers:[Object],incorrectAnswers:[Object],notSelectedAnswers:[Object],ball:Number,percentageResult:Number,countNotSelectedAnswers:Number}),o=r.model("results",i);n.get("/",a,(async(e,t)=>{let s=e.query.page||1,a=e.query.limit||10,r=e.query.query,n=e.user.userID;if("me"===r)try{o.find({testerId:n}).skip((s-1)*a).limit(a).exec(((e,s)=>{e||o.countDocuments({testerId:n},((e,a)=>t.status(200).send({results:s,total:a})))}))}catch(e){console.log(e)}finally{return}if("mySubjects"===r)try{o.find({subjectAuthorId:n}).skip((s-1)*a).limit(a).exec(((e,s)=>{if(!e)return t.status(200).send({results:s,total:s.length})}))}catch(e){return t.send({message:e.message})}finally{return}if("all"===r)try{o.find().skip((s-1)*a).limit(a).exec(((e,s)=>{e||o.countDocuments(((e,a)=>t.status(200).send({results:s,total:a})))}))}catch(e){return t.send({message:e.message})}finally{return}return t.status(400).send({message:"Xatolik yuz berdi!"})})),e.exports={resultController:n,Result:o}},887:(e,t,s)=>{const{Router:a}=s(860),{User:r,userValSchema:n}=s(332),i=s(432),o=a(),u=s(344),d=s(872),l=s(738),c=l.diskStorage({destination:function(e,t,s){s(null,"public/uploads/")},filename:function(e,t,s){s(null,t.originalname.split(" ").join("_"))}}),m=l({storage:c});o.post("/login",(async(e,t)=>{let{email:s,password:a}=e.body;if(!s||!a)return t.status(400).json({message:"Ma'lumotlar to'liq kiritilmagan"});let n=await r.findOne({email:s});if(!n)return t.status(400).json({message:"Siz kiritgan email bo'yicha ma'lumot topilmadi"});if(!await i.compare(a,n.password))return t.status(400).json({message:"Parol xato kiritildi"});let o={userID:n._id,email:n.email};const d=u.sign(o,process.env.JSON_SIGNATURE,{expiresIn:86400});n.password=void 0,t.status(200).send({user:n,token:d})})),o.post("/register",(async(e,t)=>{const{error:s,value:a}=n.validate(e.body);if(s)return t.status(400).json({message:s.details[0].message});let{email:i,phoneNumber:o}=e.body,d=await r.findOne({email:i}),l=await r.findOne({phoneNumber:o});if(d)return t.status(400).json({message:"Bu email orqali allaqachon tizimdan ro'yhatdan o'tilgan"});if(l)return t.status(400).json({message:"Bu raqam orqali allaqachon tizimdan ro'yhatdan o'tilgan"});try{let e=await r(a),s=await e.save(),n={userID:s._id,email:s.email};const i=u.sign(n,process.env.JSON_SIGNATURE,{expiresIn:86400});return s=await r.find().select({password:0}),t.status(201).send({user:e,token:i})}catch(e){t.errored.message="Server error"}})),o.get("/user/:email",d,(async(e,t)=>{const s=e.params.email;if(!s)return t.status(400).send({message:"Bad request"});let a=await r.find();return a=a.filter((e=>e.email.toLocaleLowerCase().includes(s.toLocaleLowerCase()))),t.status(200).send(a)})),o.get("/:id/user",d,(async(e,t)=>{const s=e.params.id;if(!s)return t.status(400).send({message:"Bad request"});let a=await r.findById(s);return a.password=void 0,t.status(200).send(a)})),o.get("/user",d,(async(e,t)=>{const s=e.user,a=(await r.findById(s.userID)).role;t.status(200).send(a||"student")})),o.put("/updateUser",m.single("file"),d,(async(e,t)=>{let s=JSON.parse(e.body.form);s.pathImage=process.env.HOST+e.file.path;const a=await r.updateOne({_id:s._id},{$set:s});return t.status(200).send({message:"Muvaffaqqiyatli",updated:a,user:s})})),o.delete("/delete",(async(e,t)=>{r.findByIdAndRemove(e.query.ID,((e,s)=>e?t.status(500).json({message:"Error deleting user"}):s?t.json({message:"User succesfully deleted"}):t.status(404).json({message:"User not found"})))})),e.exports=o},177:(e,t,s)=>{const a=s(860).Router(),r=s(185),n=s(872),i=s(506),{User:o}=s(332),{Question:u}=s(865),d=s(432),l=s(738),c=l.diskStorage({destination:function(e,t,s){s(null,"public/uploads/listening/")},filename:function(e,t,s){s(null,t.originalname)}}),m=l({storage:c}),g=new r.Schema({name:String,time:Number,quizCount:Number,isDifferent:Boolean,grades:[Object],point:Number,members:[Object],authorId:String,authorFullName:String,createdDate:{type:Number,default:(new Date).getTime()},isForAll:Boolean,isStarted:{type:Boolean,default:!1},password:String,isHasPassword:Boolean,authorPathImage:String,audioPath:String}),p=i.object({name:i.string().min(4).max(50).required(),time:i.number().required(),quizCount:i.number().required(),isDifferent:i.boolean().required(),grades:i.array(),point:i.number(),members:i.array().required(),authorId:i.string().required(),authorPathImage:i.string(),authorFullName:i.string(),createdDate:i.number(),isForAll:i.boolean(),isStarted:i.boolean().required(),password:i.string(),isHasPassword:i.boolean().required(),audioPath:i.string()});g.pre("save",(function(e){const t=this;if(!t.isModified("password"))return e();d.hash(t.password,10,(function(s,a){if(s)return e(s);t.password=a,e()}))}));const f=r.model("subjects",g);a.get("/",n,(async(e,t)=>{let s=e.user.userID,a=await o.findById(s),{limit:r,page:n,isForReference:i}=e.query;r=Number(e.query.limit),n=Number(e.query.page),i=Boolean(e.query.isForReference),!0===e.query.isForReference||"true"===e.query.isForReference?"admin"===a.role?f.find().skip((n-1)*r).limit(r).exec(((e,s)=>{e||f.countDocuments(((e,a)=>t.status(200).send({subjects:s,total:a})))})):f.find({authorId:s}).skip((n-1)*r).limit(r).exec(((e,a)=>{e||f.countDocuments({authorId:s},((e,s)=>t.status(200).send({subjects:a,total:s})))})):"admin"===a.role?f.find().skip((n-1)*r).limit(r).exec(((e,s)=>{e||f.countDocuments(((e,a)=>t.status(200).send({subjects:s,total:a})))})):f.find({$or:[{authorId:s},{isStarted:!0,members:{$elemMatch:{value:a.email}}}]}).skip((n-1)*r).limit(r).exec(((e,r)=>{e||f.countDocuments({$or:[{authorId:s},{isStarted:!0,members:{$elemMatch:{value:a.email}}}]},((e,s)=>t.status(200).send({subjects:r,total:s})))}))})),a.post("/add",m.single("audio"),n,(async(e,t)=>{let s=JSON.parse(e.body.form),a=e.file;const{error:r,value:n}=p.validate(s);if(r)return t.status(400).json({message:r.details[0].message});null==a&&null==a||(n.audioPath=process.env.HOST+a.path);const i=await o.findById(e.user.userID);n.authorFullName=i.firstName+" "+i.lastName,n.authorPathImage=i.pathImage;let u=await f(n),d=await u.save();d.password=void 0,t.status(201).send({savedSubject:d,message:"Fan muvaffaqqiyatli qo'shildi"})})),a.get("/:id",(async(e,t)=>{let s=e.params.id;if("undefined"===s||"null"===s)return t.status(400).send({message:"Fan identifikatori topilmadi..."});let a=await f.findById(s);if(!a)return t.status(404).json({message:"Fan topilmadi"});for(let e=0;e<a.grades.length;e++){const t=await u.find({ball:+a.grades[e].grade}).countDocuments();a.grades[e].countQuestions=t||0}return a.password=void 0,t.status(200).send(a)})),a.put("/update",n,(async(e,t)=>{const{error:s,value:a}=p.validate(e.body);if(s)return t.status(400).json({message:s.details[0].message});d.hash(a.password,10,((s,r)=>{if(s&&a.isHasPassword)return t.status(400).send({message:"Parolni saqlashda xatolik!"});a.password=r,f.findByIdAndUpdate(e.query.ID,a,{new:!0},((e,s)=>e?t.status(500).json({message:"Error finding subject"}):s?t.json({message:"Subject succesfully updated"}):t.status(404).json({message:"Subject not found"})))}))})),a.put("/statusUpdate",n,(async(e,t)=>{const{status:s,subjectID:a}=e.body,r=await f.updateOne({_id:a},{$set:{isStarted:s}}),n=await f.find({authorId:e.user.userID});return t.status(200).send({message:"Muvaffaqqiyatli",updated:r,subjects:n})})),a.delete("/delete",(async(e,t)=>{let s=e.query.ID;try{const e=await u.deleteMany({subjectId:s});f.findByIdAndRemove(s,((s,a)=>s?t.status(500).json({message:"Error deleting subject"}):a?t.json({message:`Subject and ${e.deletedCount} questions deleted.`}):t.status(404).json({message:"Subject not found"})))}catch(e){console.error(e),t.status(500).send("Internal server error")}})),a.post("/checkPassword",n,(async(e,t)=>{const{subject:s,password:a}=e.body,r=await f.findById(s._id);return await d.compare(a,r.password)?t.status(200).send({isAllowed:!0}):t.status(400).send({message:"Parol xato kiritildi..."})})),e.exports={subjectController:a,Subject:f}},473:(e,t,s)=>{const a=s(986),{Router:r}=s(860),n=s(506),i=s(185),o=s(872),u=r();u.use(a.json());let d=i.Schema({name:String,description:String,date:{type:Date,default:Date.now},img:Buffer,endDate:Date,authorId:String,isMaked:Boolean,makedDate:Date,isLated:Boolean}),l=n.object({name:n.string().required(),description:n.string().required(),endDate:n.date().required(),authorId:n.string().required(),isMaked:n.boolean().required()}),c=i.model("todos",d);u.get("/",o,(async(e,t)=>{let s=e.query.page||1,a=e.query.limit||10,r=await c.find({authorId:e.user.userID}).skip((s-1)*a).limit(a),n=await c.countDocuments();t.status(200).send({todos:r,total:n})})),u.post("/add",o,(async(e,t)=>{let s=e.body;e.body.authorId=e.user.userID;let{error:a,value:r}=l.validate(e.body);if(a)return t.status(400).send({message:a.details[0].message});const n=new c(s);await n.save(),t.status(201).send({message:"Todo added succesfully"})})),u.get("/:id",(async(e,t)=>{let s=e.params.id,a=await c.findById(s);a&&t.status(200).send(a)})),u.put("/update",(async(e,t)=>{new Date(new Date(e.body.endDate)-new Date).getFullYear()>=1970&&(e.body.isLated=!1),c.findByIdAndUpdate(e.query.ID,e.body,{new:!0},((e,s)=>e?t.status(500).json({message:"Error finding todo"}):s?t.json({message:"Todo succesfully updated"}):t.status(404).json({message:"Todo not found"})))})),u.put("/statusUpdate",o,(async(e,t)=>{e.body.status;const s=e.query.ID,a=await c.updateOne({_id:s},{$set:{isMaked:!0,makedDate:(new Date).getTime()}});return t.status(200).send(a)})),u.delete("/delete",(async(e,t)=>{c.findByIdAndRemove(e.query.ID,((e,s)=>e?t.status(500).json({message:"Error deleting todo"}):s?t.json({message:"Todo succesfully deleted"}):t.status(404).json({message:"Todo not found"})))})),e.exports={router:u,Todo:c}},332:(e,t,s)=>{const{default:a}=s(185),r=s(860).Router(),n=s(432),i=s(506),o=s(872),u=a.Schema({firstName:String,lastName:String,birdthData:String,email:{type:String,unique:!0},phoneNumber:{type:Number,unique:!0},role:String,permissions:Array,password:String,dataRegister:{type:Number,default:(new Date).getTime()},pathImage:String}),d=i.object({firstName:i.string().min(5).max(30).required(),lastName:i.string().min(5).max(30).required(),birdthData:i.string().required(),email:i.string().email().required(),phoneNumber:i.number().required(),role:i.string().required(),permissions:i.string(),password:i.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),dataRegister:i.number()});u.pre("save",(function(e){const t=this;if(!t.isModified("password"))return e();n.hash(t.password,10,(function(s,a){if(s)return e(s);t.password=a,e()}))}));let l=a.model("users",u);r.get("/",o,(async(e,t)=>{let s=await l.find().select({password:0});t.send(s)})),e.exports={User:l,userValSchema:d,router:r}},432:e=>{"use strict";e.exports=require("bcryptjs")},986:e=>{"use strict";e.exports=require("body-parser")},455:e=>{"use strict";e.exports=require("compression")},582:e=>{"use strict";e.exports=require("cors")},142:e=>{"use strict";e.exports=require("dotenv")},860:e=>{"use strict";e.exports=require("express")},506:e=>{"use strict";e.exports=require("joi")},344:e=>{"use strict";e.exports=require("jsonwebtoken")},11:e=>{"use strict";e.exports=require("mime")},185:e=>{"use strict";e.exports=require("mongoose")},738:e=>{"use strict";e.exports=require("multer")},147:e=>{"use strict";e.exports=require("fs")}},t={};function s(a){var r=t[a];if(void 0!==r)return r.exports;var n=t[a]={exports:{}};return e[a](n,n.exports,s),n.exports}(()=>{const e=s(860),t=s(185),a=s(986),r=s(582),n=s(142),i=s(53),o=s(147),u=s(11);n.config({path:".env.production"}),u.define({"text/css":["css"],"image/png":["png"],"image/jpeg":["jpg","jpeg"],"application/pdf":["pdf"],"audio/mpeg":["mp3"],"audio/wav":["wav"],"audio/ogg":["ogg"],"audio/midi":["midi"],"audio/webm":["webm"]},{force:!0}),t.set("strictQuery",!1),t.connect(process.env.DB_HOST,{}).then((()=>{console.log("MongoDB ga ulanish muvaffaqqiyatli amalga oshirildi","address :"+process.env.DB_HOST)})).catch((e=>{console.log("MongoDB ga ulanishda xato ro'y berdi",e)}));const d=e();d.use(e.static("public")),d.use(a.json({limit:"6mb"})),d.use(a.urlencoded({limit:"6mb",extended:!0})),d.use(r({origin:["https://fozilbek.netlify.app","http://localhost:8080","http://localhost:5173"],methods:["GET","POST","PUT","DELETE"],allowedHeaders:["Content-Type","Authorization"]})),d.get("/",((e,t)=>{t.send({message:"Assalomu alaykum!"})})),d.get("/public/uploads/:filename",(async(e,t)=>{let s=e.params.filename;o.access(`${__dirname}/public/uploads/${s}`,(a=>{if(a)return console.error(a),t.status(404).send("Fayl topilmadi");if(e.params.filename.includes(".png"))t.type("png");else if(e.params.filename.includes(".jpg"))t.type("jpg");else{if(!e.params.filename.includes(".jpeg"))return t.status(400).send({message:"Fayl ko'rsatilgan tipda emas!"});t.type("jpeg")}return t.sendFile(`${__dirname}/public/uploads/${s}`)}))})),d.get("/public/uploads/listening/:filename",((e,t)=>{let s=e.params.filename;o.access(`${__dirname}/public/uploads/listening/${s}`,(function(a,r){if(!a){if(e.params.filename.includes(".mp3"))t.type("mp3");else if(e.params.filename.includes(".wav"))t.type("wav");else if(e.params.filename.includes(".ogg"))t.type("ogg");else if(e.params.filename.includes(".midi "))t.type("midi");else{if(!e.params.filename.includes(".webm "))return t.status(400).send({message:"Fayl ko'rsatilgan tipda emas!"});t.type("webm")}return t.sendFile(`${__dirname}/public/uploads/listening/${s}`)}console.error(a)}))})),d.use("/api",i),d.listen(3e3,(()=>{console.log("Server is listening in ",3e3,"mode : ","production")}))})()})();