    // Utility: random data
    const rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;

    // Chart instances
    let revenueChart, userBarChart, regionDonutChart;

    // Create charts on DOM ready
    document.addEventListener('DOMContentLoaded',()=>{

      // Revenue line chart
      const rctx = document.getElementById('revenueChart').getContext('2d');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const base = months.map((m,i)=> Math.round(Math.sin(i/2)*2000 + 8000 + rand(-600,600)));
      revenueChart = new Chart(rctx, {
        type:'line',
        data:{
          labels: months,
          datasets:[{
            label:'Revenue',
            data: base,
            fill:true,
            tension:0.35,
            pointRadius:4,
            backgroundColor: createGradient(rctx),
            borderColor:'#6d5cf7',
            borderWidth:2
          }]
        },
        options:{
          responsive:true,
          animation:{duration:900,easing:'easeOutCubic'},
          plugins:{legend:{display:false}},
          scales:{
            y:{grid:{display:false},ticks:{maxTicksLimit:5}},
            x:{grid:{display:false}}
          }
        }
      });

      // User growth bar chart
      const bctx = document.getElementById('userBar').getContext('2d');
      userBarChart = new Chart(bctx, {
        type:'bar',
        data:{
          labels: months,
          datasets:[{
            label:'Signups',
            data: months.map(()=>rand(120,900)),
            borderRadius:6,
            backgroundColor: function(ctx){
              const i = ctx.dataIndex; return i%2===0 ? 'rgba(33,147,176,0.88)' : 'rgba(123,47,247,0.88)';
            },
          }]
        },
        options:{
          responsive:true,
          animation:{duration:800},
          plugins:{legend:{display:false}},
          scales:{
            y:{grid:{color:'rgba(10,14,22,0.04)'}},
            x:{grid:{display:false}}
          }
        }
      });

      // Region donut
      const dctx = document.getElementById('regionDonut').getContext('2d');
      const regions = ['North America','Europe','Asia','South America','Africa'];
      const regionData = regions.map(()=>rand(8,34));
      regionDonutChart = new Chart(dctx, {
        type:'doughnut',
        data:{
          labels:regions,
          datasets:[{
            data:regionData,
            backgroundColor:['#6dd5ed','#7b2ff7','#2193b0','#8e7dff','#69b3ff'],
            hoverOffset:8
          }]
        },
        options:{
          responsive:true,
          animation:{duration:700},
          plugins:{legend:{display:false}}
        }
      });

      // render legend
      const legend = document.getElementById('regionLegend');
      regionDonutChart.data.labels.forEach((lbl,i)=>{
        const el = document.createElement('div');
        el.style.display='flex';el.style.alignItems='center';el.style.gap='8px';el.style.fontSize='13px';
        el.innerHTML = `<div style="width:12px;height:12px;border-radius:3px;background:${regionDonutChart.data.datasets[0].backgroundColor[i]}"></div><div>${lbl} <span style="color:var(--muted)">(${regionDonutChart.data.datasets[0].data[i]})</span></div>`;
        legend.appendChild(el);
      });

      // populate transactions table
      const txBody = document.getElementById('txBody');
      const statuses = ['Paid','Pending','Refunded','Failed'];
      for(let i=0;i<6;i++){
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>Customer ${String.fromCharCode(65+i)}</td><td>Product ${rand(1,12)}</td><td>$${rand(12,850)}</td><td><span class="status" style="background:${i%3===0?'#e9f8f5':'#fff4e6'};color:${i%3===0?'#0b6b5f':'#a36b00'}">${statuses[rand(0,statuses.length-1)]}</span></td><td>${new Date(Date.now()-rand(1,10)*86400000).toLocaleDateString()}</td>`;
        txBody.appendChild(tr);
      }

      // KPI count-up initial
      startCountUp('kpiUsers', rand(4200,12800));
      startCountUp('kpiRev', rand(45000,124800), true);
      startCountUp('kpiSignups', rand(20,420));

      // set last update
      document.getElementById('lastUpdate').innerText = new Date().toLocaleString();

    });

    // Gradient for revenue chart
    function createGradient(ctx){
      const g = ctx.createLinearGradient(0,0,0,200);
      g.addColorStop(0,'rgba(123,47,247,0.16)');
      g.addColorStop(1,'rgba(33,147,176,0.04)');
      return g;
    }

    // count-up utility
    function startCountUp(id, target, prefix=false){
      const el = document.getElementById(id);
      const start = 0; const duration = 1100; const startTime = performance.now();
      const step = (t)=>{
        const p = Math.min((t-startTime)/duration,1);
        const val = Math.round(start + (target-start)*easeOutCubic(p));
        el.innerText = prefix ? ('$'+val.toLocaleString()) : val.toLocaleString();
        if(p<1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function easeOutCubic(t){return 1 - Math.pow(1 - t, 3);}

    // sidebar collapse
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    collapseBtn.addEventListener('click',()=>{ sidebar.classList.toggle('collapsed'); });

    // flip revenue card
    const revenueFlip = document.getElementById('revenueFlip');
    document.getElementById('toggleDetail').addEventListener('click',()=> revenueFlip.classList.toggle('flipped'));

    // update revenue data on button
    document.getElementById('updateRevenue').addEventListener('click',()=>{
      const ds = revenueChart.data.datasets[0];
      // tweak data with smooth easing
      ds.data = ds.data.map(v => Math.max(2000, Math.round(v * (0.9 + Math.random()*0.3))));
      revenueChart.update();
      // update KPI values as well
      startCountUp('kpiUsers', rand(4200,14800));
      startCountUp('kpiRev', rand(35000,154800), true);
      document.getElementById('revNow').innerText = Math.round(ds.data[ds.data.length-1]).toLocaleString();
      document.getElementById('lastUpdate').innerText = new Date().toLocaleString();
      // animate transaction rows to show change
      const rows = document.querySelectorAll('#txBody tr');
      rows.forEach((r,i)=>{ r.style.transform='translateY(-6px)'; setTimeout(()=> r.style.transform='', 350 + i*60); });
    });

    // accessibility: search input quick focus on '/'
    document.addEventListener('keydown', (e)=>{ if(e.key==='/' && document.activeElement.id!=='searchInput'){ e.preventDefault(); document.getElementById('searchInput').focus(); } });

    // small: animate bar chart periodically (simulates new data)
    setInterval(()=> {
      if(userBarChart){
        userBarChart.data.datasets[0].data = userBarChart.data.datasets[0].data.map(v => Math.max(80, Math.round(v * (0.95 + Math.random()*0.1))));
        userBarChart.update();
      }
    }, 7000);

    // make tables accessible (striped focus)
    document.querySelectorAll('tbody tr').forEach((tr)=>{ tr.tabIndex=0; tr.addEventListener('focus',()=> tr.style.outline='2px solid rgba(123,47,247,0.12)'); tr.addEventListener('blur',()=> tr.style.outline='none'); });