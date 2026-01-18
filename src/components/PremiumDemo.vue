<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 text-gray-100 font-sans overflow-hidden relative selection:bg-emerald-500/30">
    <!-- Background Ambient Effects -->
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-emerald-600/15 to-teal-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div class="absolute bottom-[-20%] left-[-10%] w-[45%] h-[45%] bg-gradient-to-tr from-violet-600/15 to-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      <div class="absolute top-[40%] left-[50%] w-[25%] h-[25%] bg-gradient-to-r from-amber-500/10 to-orange-500/8 rounded-full blur-[80px] animate-float"></div>
      
      <!-- Subtle Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      
      <!-- Noise Texture Overlay -->
      <div class="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]"></div>
    </div>

    <!-- Main Content Container -->
    <div class="relative z-10 container mx-auto px-6 py-8 min-h-screen flex flex-col">
      
      <!-- Navbar -->
      <nav class="flex justify-between items-center mb-16 animate-slide-down">
        <div class="flex items-center gap-3 group cursor-pointer">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-300">
            <span class="text-xl font-bold text-white">V</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-bold tracking-tight text-white">
              VocabMan
            </span>
            <span class="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Premium Edition</span>
          </div>
        </div>
        
        <div class="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full p-1.5 border border-white/10 shadow-lg">
          <a href="#" class="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm">学习</a>
          <a href="#" class="px-5 py-2 text-sm font-medium text-gray-400 hover:text-emerald-400 rounded-full hover:bg-white/5 transition-all">词库</a>
          <a href="#" class="px-5 py-2 text-sm font-medium text-gray-400 hover:text-emerald-400 rounded-full hover:bg-white/5 transition-all">统计</a>
          <a href="#" class="px-5 py-2 text-sm font-medium text-gray-400 hover:text-emerald-400 rounded-full hover:bg-white/5 transition-all">成就</a>
        </div>

        <div class="flex items-center gap-3">
           <button class="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all text-gray-400 hover:text-emerald-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-slate-800 overflow-hidden ring-2 ring-transparent hover:ring-emerald-400/50 transition-all cursor-pointer shadow-lg shadow-amber-500/20">
             <img src="https://ui-avatars.com/api/?name=ZC&background=f59e0b&color=fff&bold=true" alt="User" class="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      <!-- Main Layout -->
      <div class="grid lg:grid-cols-12 gap-8 flex-1">
        
        <!-- Left Column: Word Card (Hero) -->
        <div class="lg:col-span-7 flex flex-col justify-center animate-slide-right">
          
          <div class="mb-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              正在学习中 · 今日第 18 个
            </div>
            <h1 class="text-5xl md:text-7xl font-bold text-white mb-3 tracking-tight">
              Serendipity
            </h1>
            <div class="flex items-center gap-4 text-gray-400">
               <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                 <svg class="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                 <span class="text-sm font-medium text-gray-300 group-hover:text-emerald-300">/ˌsɛrənˈdɪpɪti/</span>
               </button>
               <span class="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-sm font-medium border border-amber-500/20">名词</span>
               <div class="flex items-center gap-0.5">
                 <span class="text-amber-400 text-lg">★★★★</span><span class="text-gray-600 text-lg">★</span>
               </div>
            </div>
          </div>

          <!-- Premium Glass Card -->
          <div class="group relative">
            <!-- Glow Effect -->
            <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-[28px] opacity-15 group-hover:opacity-25 blur-xl transition-all duration-500"></div>
            
            <!-- Card -->
            <div class="relative bg-slate-800/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl transform transition-all duration-500 hover:shadow-emerald-500/10 hover:-translate-y-1">
              
              <div class="flex flex-col gap-6">
                 <!-- Chinese Definition -->
                 <div class="p-5 rounded-2xl bg-slate-900/50 border border-white/5">
                    <div class="flex items-center gap-2 mb-3">
                      <span class="w-1.5 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500"></span>
                      <h3 class="text-sm font-bold text-gray-300">中文释义</h3>
                    </div>
                    <p class="text-xl text-gray-100 leading-relaxed font-medium">
                      偶然发现美好事物的能力；意外收获；机缘巧合
                    </p>
                 </div>

                 <!-- English Definition -->
                 <div class="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div class="flex items-center gap-2 mb-3">
                      <span class="w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-emerald-500"></span>
                      <h3 class="text-sm font-bold text-emerald-400">English Definition</h3>
                    </div>
                    <p class="text-lg text-emerald-200/80 leading-relaxed italic">
                      The occurrence and development of events by chance in a happy or beneficial way.
                    </p>
                 </div>

                 <!-- Context Sentence -->
                 <div class="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"></span>
                        <h3 class="text-sm font-bold text-amber-400">语境例句</h3>
                      </div>
                      <span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-xs font-medium border border-amber-500/20">AI 生成</span>
                    </div>
                    <p class="text-lg text-amber-100/80 leading-relaxed">
                      "It was pure <span class="font-semibold text-amber-300 underline decoration-amber-500 decoration-2 underline-offset-2">serendipity</span> that we met at the coffee shop right before the rain started."
                    </p>
                    <p class="text-sm text-amber-300/50 mt-2">在雨开始前我们恰巧在咖啡店相遇，真是一种美妙的偶然。</p>
                 </div>

                 <!-- Action Buttons -->
                 <div class="flex gap-4 mt-2">
                    <button class="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                       <span>认识了</span>
                    </button>
                    <button class="flex-1 py-4 rounded-2xl bg-slate-700/50 border border-white/10 text-gray-300 font-semibold hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                       <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       <span>再复习</span>
                    </button>
                 </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Stats & Progress -->
        <div class="lg:col-span-5 flex flex-col gap-5 animate-slide-left delay-100">
          
          <!-- Daily Goal Card -->
          <div class="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:border-emerald-500/20 transition-all">
             <div class="flex justify-between items-start mb-5">
                <div>
                   <h3 class="text-gray-500 text-sm font-medium mb-1">今日目标</h3>
                   <div class="text-4xl font-bold text-white">18<span class="text-gray-500 text-xl font-normal">/20</span></div>
                </div>
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
                   90%
                </div>
             </div>
             <div class="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full w-[90%] shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000"></div>
             </div>
             <p class="text-sm text-gray-500 mt-3">还差 <span class="text-emerald-400 font-semibold">2</span> 个单词完成今日目标 🎯</p>
          </div>

          <!-- Streak & Total Grid -->
           <div class="grid grid-cols-2 gap-5">
              <div class="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:border-orange-500/20 hover:-translate-y-1 transition-all group">
                 <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span class="text-2xl">🔥</span>
                 </div>
                 <div class="text-3xl font-bold text-white">12</div>
                 <div class="text-sm text-gray-500 font-medium">天连续学习</div>
              </div>
              
              <div class="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:border-violet-500/20 hover:-translate-y-1 transition-all group">
                 <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span class="text-2xl">📚</span>
                 </div>
                 <div class="text-3xl font-bold text-white">482</div>
                 <div class="text-sm text-gray-500 font-medium">已掌握单词</div>
              </div>
           </div>

           <!-- Recent History -->
           <div class="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-lg flex-1">
              <div class="flex items-center justify-between mb-5">
                <h3 class="text-gray-200 font-semibold">最近掌握</h3>
                <button class="text-sm text-emerald-400 hover:text-emerald-300 font-medium">查看全部 →</button>
              </div>
              <div class="space-y-3">
                 <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                    <div class="flex items-center gap-4">
                       <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">E</div>
                       <div>
                         <div class="font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors">Ebullient</div>
                         <div class="text-xs text-gray-500">形容词 · 热情洋溢的</div>
                       </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-1 rounded-lg">已掌握</span>
                    </div>
                 </div>
                 <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                    <div class="flex items-center gap-4">
                       <div class="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">E</div>
                       <div>
                         <div class="font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors">Ephemeral</div>
                         <div class="text-xs text-gray-500">形容词 · 短暂的</div>
                       </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-1 rounded-lg">已掌握</span>
                    </div>
                 </div>
                 <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                    <div class="flex items-center gap-4">
                       <div class="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">L</div>
                       <div>
                         <div class="font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors">Luminous</div>
                         <div class="text-xs text-gray-500">形容词 · 发光的</div>
                       </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-1 rounded-lg">已掌握</span>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* Keyframe Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.animate-float {
  animation: float 12s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 10s ease-in-out infinite;
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-down {
  animation: slide-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-right {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-right {
  animation: slide-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  opacity: 0;
}

@keyframes slide-left {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-left {
  animation: slide-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
  opacity: 0;
}
</style>
