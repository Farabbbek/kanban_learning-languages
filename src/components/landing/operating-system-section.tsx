import { BarChart3, Brain, KanbanSquare, Languages, Repeat2, Grid3x3, Bell, Search, Menu, LayoutDashboard, Folder, Flame, ShieldCheck, Clock, Bookmark } from "lucide-react";
import Image from "next/image";
import section2Bg from "@/utils/section2.png";

const features = [
  {
    icon: KanbanSquare,
    title: "TaskFlow",
    copy: "Organize goals and daily tasks with calm kanban boards.",
  },
  {
    icon: Languages,
    title: "LinguaLab",
    copy: "Learn vocabulary with spaced repetition and smart lists.",
  },
  {
    icon: Brain,
    title: "AI Agent",
    copy: "Your personal tutor that helps you learn faster.",
  },
  {
    icon: Repeat2,
    title: "Smart Reviews",
    copy: "Adaptive questions that fit your level and rhythm.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    copy: "Track progress and build consistency without pressure.",
  },
];

const columns = [
  {
    title: "Backlog",
    status: "backlog",
    cards: [
      { text: "Learn 20 new Chinese words", tag: "Chinese", tagColor: "bg-red-500/10 text-red-600 border-red-500/20" },
      { text: "Practice listening for 15 min", tag: "Audio", tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      { text: "Review grammar videos", tag: "Grammar", tagColor: "bg-blue-500/10 text-blue-600 border-blue-500/20" }
    ],
  },
  {
    title: "In Progress",
    status: "progress",
    cards: [
      { text: "Study Italian vocabulary", tag: "Italian", tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
      { text: "Write daily journal", tag: "Writing", tagColor: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    ],
  },
  {
    title: "Review",
    status: "review",
    cards: [
      { text: "Flashcard session", tag: "Review", tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
      { text: "Travel vocabulary", tag: "Theme", tagColor: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
    ],
  },
  {
    title: "Done",
    status: "done",
    cards: [
      { text: "Complete unit 3", tag: "Milestone", tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    ],
  },
];

export function OperatingSystemSection() {
  return (
    <section id="features" className="cinematic-next-section relative -mt-[15vh] overflow-hidden pt-[20vh] pb-32">
      {/* Background Image Setup */}
      <div className="absolute inset-0 z-[-2]">
        <Image 
          src={section2Bg} 
          alt="Operating System Background" 
          fill 
          priority
          sizes="100vw"
          className="object-cover object-top opacity-30 mix-blend-luminosity"
        />
      </div>

      <div className="absolute inset-0 z-[-1] cinematic-transition-texture pointer-events-none opacity-20" />

      {/* Seamless Transition Gradients */}
      <div className="absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/80 to-transparent pointer-events-none z-[-1]" />
      <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/90 to-transparent pointer-events-none z-[-1]" />
      <div className="absolute inset-0 bg-[#fbf7f1]/30 mix-blend-multiply pointer-events-none z-[-1]" />

      {/* Layered circles & glowing particles behind */}
      <div className="absolute top-[20%] right-[10%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(215,90,60,0.05)_0%,transparent_60%)] blur-[80px] pointer-events-none z-[-1]" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(110,130,160,0.06)_0%,transparent_60%)] blur-[80px] pointer-events-none z-[-1]" />
      
      <div className="container relative z-10 mx-auto grid items-center gap-16 px-6 lg:grid-cols-12 lg:px-8 xl:gap-24 uppercase-tracking">
        
        {/* Left Side: Headline & Feature List */}
        <div className="lg:col-span-4 lg:pr-4 flex flex-col justify-center relative">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.08] bg-white/40 px-3 py-1.5 backdrop-blur-md mb-8 shadow-sm">
             <div className="size-1.5 rounded-full bg-[#D75A3C] shadow-[0_0_8px_rgba(215,90,60,0.6)]" />
             <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
               The operating system
             </span>
          </div>
          
          <h2 className="max-w-sm text-4xl font-heading leading-[1.15] text-foreground sm:text-5xl lg:text-[3.25rem]">
            Learn and stay <span className="italic font-light text-[#D75A3C]/90">disciplined.</span>
          </h2>
          <p className="mt-8 max-w-sm text-[15px] font-light leading-relaxed text-muted-foreground/90">
            A unified cinematic environment for language learning, deep focus, AI-assisted studying,
            and personal growth.
          </p>

          <div className="mt-14 flex flex-col gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group flex items-start gap-4 rounded-[1.25rem] border border-white/40 bg-white/20 p-4 transition-all duration-500 hover:border-white/80 hover:bg-white/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:backdrop-blur-xl"
              >
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white/80 shadow-sm border border-black/[0.04] text-foreground/70 transition-all duration-500 group-hover:scale-105 group-hover:text-[#D75A3C] group-hover:shadow-md backdrop-blur-md">
                  <feature.icon className="size-4.5" strokeWidth={1.5} />
                </span>
                <div>
                  <span className="block text-sm font-semibold tracking-wide text-foreground/90 transition-colors group-hover:text-foreground">{feature.title}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground/80 transition-colors group-hover:text-muted-foreground">{feature.copy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Beautiful Realistic Dashboard */}
        <div className="relative lg:col-span-8 perspective-[2000px]">
          
          {/* Dashboard Glow Effects */}
          <div className="absolute top-[20%] right-[30%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.6)_0%,transparent_70%)] blur-[40px] pointer-events-none -z-10" />

          {/* Device Frame */}
          <div className="relative rounded-[2rem] border border-white/60 bg-white/40 p-2 shadow-[0_40px_100px_rgba(20,10,5,0.08),0_10px_40px_rgba(20,10,5,0.04),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl ring-1 ring-black/[0.02] transform-gpu transition-transform duration-700 hover:scale-[1.01] hover:shadow-[0_50px_120px_rgba(20,10,5,0.12),0_15px_50px_rgba(20,10,5,0.06),inset_0_1px_0_rgba(255,255,255,1)]">
            
            {/* Inner Dashboard Wrapper */}
            <div className="relative overflow-hidden rounded-[1.5rem] border border-black/[0.05] bg-white/60 shadow-inner flex flex-col md:flex-row h-[700px]">
              
              {/* Left Sidebar Nav */}
              <div className="hidden md:flex w-64 flex-col border-r border-black/[0.04] bg-white/50 backdrop-blur-xl p-5 justify-between">
                 <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-2.5 px-2">
                       <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#D75A3C] to-[#b14930] shadow-sm text-white">
                          <Grid3x3 className="size-3.5" />
                       </div>
                       <span className="font-semibold text-sm tracking-wide text-foreground/90">TaskFlow</span>
                    </div>

                    <div className="flex flex-col gap-1.5 relative">
                       <div className="absolute left-0 top-[6px] h-8 w-1 rounded-r-full bg-[#D75A3C]" />
                       <div className="flex items-center gap-3 rounded-xl bg-black/[0.03] px-3 py-2 text-[#D75A3C]">
                          <LayoutDashboard className="size-4" strokeWidth={2} />
                          <span className="text-[13px] font-medium">Dashboard</span>
                       </div>
                       <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground/70 transition-colors hover:bg-black/[0.02] hover:text-foreground">
                          <KanbanSquare className="size-4" strokeWidth={1.5} />
                          <span className="text-[13px] font-medium">Kanban</span>
                       </div>
                       <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground/70 transition-colors hover:bg-black/[0.02] hover:text-foreground">
                          <Languages className="size-4" strokeWidth={1.5} />
                          <span className="text-[13px] font-medium">LinguaLab</span>
                       </div>
                       <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground/70 transition-colors hover:bg-black/[0.02] hover:text-foreground">
                          <Folder className="size-4" strokeWidth={1.5} />
                          <span className="text-[13px] font-medium">Collections</span>
                       </div>
                    </div>
                 </div>

                 {/* Sidebar Bottom */}
                 <div className="flex items-center gap-3 px-2 py-3 border-t border-black/5">
                    <div className="size-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-semibold">U</div>
                    <div className="flex flex-col">
                       <span className="text-xs font-semibold text-foreground/80">User Space</span>
                       <span className="text-[10px] text-muted-foreground">Pro Plan</span>
                    </div>
                 </div>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-col flex-1 bg-gradient-to-br from-[#fafafa]/80 to-[#fdfdfd]/90">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/[0.04] bg-white/40 px-8 py-5 backdrop-blur-md">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Current Sprint</h3>
                    <p className="text-xs text-muted-foreground mt-1">Oct 24 - Oct 31 • 4 Days left</p>
                  </div>
                  
                  <div className="hidden items-center gap-3 md:flex">
                    <div className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-2 shadow-sm transition-colors hover:bg-black/[0.01]">
                      <Search className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground pr-4">Search tasks...</span>
                      <span className="text-[10px] font-medium text-muted-foreground/60 border border-black/10 rounded px-1.5 py-0.5">⌘K</span>
                    </div>
                    <button className="flex size-9 items-center justify-center rounded-full bg-white border border-black/[0.06] shadow-sm text-foreground/70 hover:bg-black/[0.02] transition-colors"><Bell className="size-4" /></button>
                  </div>
                  <button className="flex size-9 md:hidden items-center justify-center rounded-full bg-white border border-black/[0.06] shadow-sm text-foreground/70 hover:bg-black/[0.02] transition-colors"><Menu className="size-4" /></button>
                </div>

                {/* Kanban Board Area */}
                <div className="p-8 flex-1 overflow-hidden flex flex-col">
                  
                  <div className="grid gap-6 md:grid-cols-4 items-start flex-1 min-h-0">
                    {columns.map((column) => (
                      <div key={column.title} className="flex flex-col gap-4 max-h-full">
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2.5">
                            <span className={`size-2.5 rounded-full shadow-inner ${
                               column.status === 'backlog' ? 'bg-zinc-300' :
                               column.status === 'progress' ? 'bg-amber-400' :
                               column.status === 'review' ? 'bg-blue-400' : 'bg-emerald-400'
                            }`} />
                            <span className="text-[12px] font-semibold tracking-wide text-foreground/80">{column.title}</span>
                          </div>
                          <span className="flex size-5 items-center justify-center rounded-full bg-black/5 text-[10px] font-semibold text-foreground/50">
                            {column.cards.length}
                          </span>
                        </div>

                        {/* Cards Container */}
                        <div className="flex flex-col gap-3.5 overflow-y-auto pb-4 custom-scrollbar">
                          {column.cards.map((card, index) => (
                            <div
                              key={index}
                              className="group relative flex flex-col gap-3.5 rounded-[14px] border border-black/[0.03] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-black/5 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[13px] font-medium leading-snug text-foreground/80 group-hover:text-foreground">
                                  {card.text}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-1 pt-3 border-t border-black/[0.03]">
                                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${card.tagColor}`}>
                                  {card.tag}
                                </span>
                                <div className="flex -space-x-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                                  <span className="size-5 rounded-full border border-white bg-zinc-200" />
                                  <span className="size-5 rounded-full border border-white bg-zinc-300" />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add Button */}
                          <button className="flex w-full items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-black/10 py-3 text-xs font-medium text-muted-foreground transition-all hover:border-black/20 hover:bg-black/[0.02] hover:text-foreground">
                            <span className="text-lg leading-none mb-0.5">+</span> Add Card
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Widgets Bottom */}
                  <div className="mt-auto pt-6 border-t border-black/[0.04] grid grid-cols-4 gap-4">
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3.5 border border-white shadow-sm backdrop-blur-md">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-orange-100/50 text-orange-600">
                           <Flame className="size-4" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Streak</span>
                           <span className="text-sm font-semibold text-foreground">14 Days</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3.5 border border-white shadow-sm backdrop-blur-md">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-100/50 text-blue-600">
                           <Bookmark className="size-4" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Words</span>
                           <span className="text-sm font-semibold text-foreground">1,248</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3.5 border border-white shadow-sm backdrop-blur-md">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100/50 text-emerald-600">
                           <ShieldCheck className="size-4" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Accuracy</span>
                           <span className="text-sm font-semibold text-foreground">94.2%</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3.5 border border-white shadow-sm backdrop-blur-md">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-100/50 text-purple-600">
                           <Clock className="size-4" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Next Review</span>
                           <span className="text-sm font-semibold text-foreground">In 2 hrs</span>
                        </div>
                     </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
