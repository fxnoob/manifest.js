const display=document.querySelector(".alarm-display"),log=document.querySelector(".alarm-log"),form=document.querySelector(".create-alarm"),clearButton=document.getElementById("clear-display"),refreshButton=document.getElementById("refresh-display");clearButton.addEventListener("click",(()=>manager.cancelAllAlarms())),refreshButton.addEventListener("click",(()=>manager.refreshDisplay())),form.addEventListener("submit",(e=>{e.preventDefault();const a=new FormData(form),t=Object.fromEntries(a),r=t["alarm-name"],l=Number.parseFloat(t["time-value"]),n=t["time-format"],s=Number.parseFloat(t.period),i={};"ms"===n?i.when=Date.now()+l:"min"===n&&(i.delayInMinutes=l),s&&(i.periodInMinutes=s),manager.createAlarm(r,i)}));class AlarmManager{constructor(e,a){this.displayElement=e,this.logElement=a,this.logMessage("Manager: initializing demo"),this.displayElement.addEventListener("click",this.handleCancelAlarm),chrome.alarms.onAlarm.addListener(this.handleAlarm)}logMessage(e){const a=new Date,t=(e,a=2)=>e.toString().padStart(a,"0"),r=`${t(a.getHours())}:${t(a.getMinutes())}:${t(a.getSeconds())}.${t(a.getMilliseconds(),3)}`,l=document.createElement("div");l.textContent=`[${r}] ${e}`,this.logElement.insertBefore(l,this.logElement.firstChild)}handleAlarm=async e=>{const a=JSON.stringify(e);this.logMessage(`Alarm "${e.name}" fired\n${a}}`),await this.refreshDisplay()};handleCancelAlarm=async e=>{if(!e.target.classList.contains("alarm-row__cancel-button"))return;const a=e.target.parentElement.dataset.name;await this.cancelAlarm(a),await this.refreshDisplay()};async cancelAlarm(e){return chrome.alarms.clear(e,(a=>{a?this.logMessage(`Manager: canceled alarm "${e}"`):this.logMessage(`Manager: could not canceled alarm "${e}"`)}))}createAlarm(e,a){chrome.alarms.create(e,a);const t=JSON.stringify(a,null,2).replace(/\s+/g," ");this.logMessage(`Created "${e}"\n${t}`),this.refreshDisplay()}renderAlarm(e,a){const t=document.createElement("div");t.classList.add("alarm-row"),t.dataset.name=e.name,t.textContent=JSON.stringify(e,0,2)+(a?"":",");const r=document.createElement("button");r.classList.add("alarm-row__cancel-button"),r.textContent="cancel",t.appendChild(r),this.displayElement.appendChild(t)}async cancelAllAlarms(){return chrome.alarms.clearAll((e=>{e?this.logMessage('Manager: canceled all alarms"'):this.logMessage("Manager: could not canceled all alarms")}))}async populateDisplay(){return chrome.alarms.getAll((e=>{for(const[a,t]of e.entries()){const r=a===e.length-1;this.renderAlarm(t,r)}}))}#e=!1;async refreshDisplay(){if(!this.#e){this.#e=!0;try{await this.clearDisplay(),await this.populateDisplay()}finally{this.#e=!1}}}async clearDisplay(){this.displayElement.textContent=""}}const manager=new AlarmManager(display,log);manager.refreshDisplay();