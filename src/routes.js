const express = require('express');
const routes = express.Router();

const views = __dirname + "/views/";

//caminho baviews 
const Profile = {
    data: {
    name: "samara",
    avatar: "https://github.com/Samara-rbd.png",
    "monthly-budget": 3000,
    "days-per-week": 5,
    "hours-per-day": 5,
    "vacation-per-year": 4,
    "value-hour": 75
    },

    controllers: {
      index(req, res) {
       return res.render(views + "profile" , { profile: Profile.data })
      },

      update (req, res){
        // req.body para pegar os dados
        const data = req.body
        // definir quantas semanas tem num ano : 52
        const weeksPerYear = 52
        // remover as semanas de férias do ano, para pegar quantas semana tem em 1 mês
        const weeksPerMonth = (weeksPerYear - data ["vacation-per-year"] )/ 12
        // quantas horas por semana estou trabalhando
        const weeksTotalHours = data["hours-per-day"] * data["days-per-week"]
        // total de horas trabalhadas no mês 
        const monthlyTotalHours = weeksTotalHours * weeksPerMonth
        // qual será o valor da minha hora?
        const valueHour = data["monthly-budget"] / monthlyTotalHours

        Profile.data = {
          ...Profile.data,
          ...req.body,
          "value-hour": valueHour
        }
        return res.redirect('/profile')
      }
    }
};

const Job = {
  data:[
    {
      id: 1,
      name: "Pizzaria Guloso",
      "daily-hours" : 2,
      "total-hours" : 1,
      created_at: Date.now()
    },
    {
    id: 2,
      name: "OneTwo Project",
      "daily-hours" : 3,
      "total-hours" : 47,
      created_at: Date.now()
    }
  ],

  controllers: {
    index(req, res) {

      const updatedJobs = Job.data.map((job) => {
        // ajustes no job
        const remaining = Job.services.remainingDays(job)
        const status = remaining <= 0 ? 'done' : 'progress'
    
        return {
          ...job,
          remaining,
          status,
          budget: Profile.data["value-hour"] * job["total-hours"]      
        }
      }) 
      
      return res.render(views + "index", {jobs: updatedJobs})
     },

     create(req, res){
       return res.render(views + "job")
     },
     save(req, res) {
      const lastId = Job.data[Job.data.length -1]?.id || 1;

      Job.data.push({
          id: lastId + 1,
          name: req.body.name,
          "daily-hours" : req.body["daily-hours"],
          "total-hours" : req.body["total-hours"],
          created_at: Date.now()//atribuindo data de hoje
      })
      return res.redirect('/')
     }
    },

  services: {
      remainingDays(job) {
        // calculo de tempo restenate
       const remainingDays = (job["total-hours"] / job ["daily-hours"]).toFixed()
   
       const createdDate = new Date(job.created_at)
       const dueDay = createdDate.getDay() + Number(remainingDays) 
       const dueDateInMs = createdDate.setDate(dueDay)
   
       const timeDiffinMs = dueDateInMs - Date.now( )
         //transformar milli em dias
       const dayInMs = 1000 * 60 *  24
       const dayDiff = Math.floor(timeDiffinMs / dayInMs)
   
       return dayDiff
      }
    }
  }
   
//req, res
routes.get('/', Job.controllers.index)
routes.get('/job', Job.controllers.create)
routes.post('/job', Job.controllers.save)   
routes.get('/job/edit', (req, res) => res.render(views +"job-edit"))
routes.post('/profile', Profile.controllers.update)

module.exports = routes;