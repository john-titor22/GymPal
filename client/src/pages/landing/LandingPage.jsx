import { Link } from 'react-router-dom';
import { useState } from 'react';

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-900 text-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-900/90 backdrop-blur-md border-b border-surface-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white text-sm">G</div>
            <span className="text-lg font-bold text-slate-100">GymPal</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-slate-100 transition">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-slate-100 transition">How it works</a>
            <a href="#reviews" className="text-sm text-slate-400 hover:text-slate-100 transition">Reviews</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg transition">Log in</Link>
            <Link to="/register" className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Get started free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-surface-800 border-t border-surface-700 px-4 py-4 flex flex-col gap-4">
            <a href="#features" className="text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#reviews" className="text-slate-300 text-sm" onClick={() => setMenuOpen(false)}>Reviews</a>
            <div className="flex gap-3 pt-2 border-t border-surface-700">
              <Link to="/login" className="flex-1 text-center text-sm text-slate-300 border border-surface-600 px-4 py-2.5 rounded-xl">Log in</Link>
              <Link to="/register" className="flex-1 text-center text-sm bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium">Get started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 text-xs text-primary-400 font-medium mb-6">
              🏋️ The ultimate gym tracker
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 leading-tight mb-4">
              Log Workouts.<br />
              <span className="text-primary-500">Get Stronger.</span><br />
              Stay Consistent.
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto md:mx-0">
              GymPal is your all-in-one workout tracker. Build programs, log sessions, and watch your progress grow — all from your phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                to="/register"
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl text-center transition text-lg"
              >
                Start for free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border border-surface-600 hover:border-surface-500 text-slate-300 font-semibold rounded-2xl text-center transition text-lg"
              >
                Log in
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-4">No credit card required · Free forever</p>
          </div>

          {/* Phone mockup */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-64 md:w-72 bg-surface-800 rounded-[2.5rem] border-4 border-surface-700 shadow-2xl overflow-hidden">
                {/* Phone screen */}
                <div className="bg-surface-900 p-4">
                  {/* Status bar */}
                  <div className="flex justify-between text-xs text-slate-500 mb-4 px-1">
                    <span>9:41</span>
                    <span>●●●</span>
                  </div>
                  {/* App header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-slate-500">Good morning 💪</p>
                      <p className="font-bold text-slate-100">Today's Workout</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">J</div>
                  </div>
                  {/* Workout card */}
                  <div className="bg-surface-800 rounded-2xl p-4 mb-3 border border-surface-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">Push Day</span>
                      <span className="text-xs text-slate-500">4 exercises</span>
                    </div>
                    {['Bench Press', 'Shoulder Press', 'Tricep Dips', 'Cable Fly'].map((ex, i) => (
                      <div key={ex} className="flex items-center gap-2 py-1.5 border-b border-surface-700 last:border-0">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${i < 2 ? 'border-primary-500 bg-primary-500' : 'border-surface-600'}`}>
                          {i < 2 && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-xs text-slate-300">{ex}</span>
                        <span className="ml-auto text-xs text-slate-500">3×10</span>
                      </div>
                    ))}
                  </div>
                  {/* Start button */}
                  <div className="bg-primary-600 rounded-xl py-3 text-center text-sm font-bold text-white">
                    Start Workout ▶
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[['4', 'This week'], ['12', 'Streak'], ['280', 'Total sets']].map(([val, label]) => (
                      <div key={label} className="bg-surface-800 rounded-xl p-2 text-center border border-surface-700">
                        <p className="text-sm font-bold text-primary-500">{val}</p>
                        <p className="text-xs text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 bg-primary-500/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 border-y border-surface-800 bg-surface-800/50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['10K+', 'Active Athletes'],
            ['500K+', 'Workouts Logged'],
            ['4.8★', 'User Rating'],
            ['100%', 'Free'],
          ].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl md:text-3xl font-extrabold text-primary-500">{val}</p>
              <p className="text-sm text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100">Everything you need to train smarter</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Built for serious gym-goers. No fluff, just the features that matter.</p>
          </div>

          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-primary-500 text-sm font-semibold mb-3">
                  <span className="w-6 h-6 bg-primary-500/20 rounded-lg flex items-center justify-center">📋</span>
                  PROGRAMS
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">Build structured workout programs</h3>
                <p className="text-slate-400 mb-6">Create multi-week programs with custom workout days — Push/Pull/Legs, Upper/Lower, or anything you design. Your program, your rules.</p>
                <ul className="space-y-3">
                  {['Create unlimited programs', 'Add custom workout days', 'Organize exercises per day', 'Set active program'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-5 h-5 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <FeatureCard
                  title="Push Day"
                  subtitle="4 exercises · Week 2"
                  items={[
                    { name: 'Bench Press', detail: '4×8 · 80kg', done: true },
                    { name: 'Overhead Press', detail: '3×10 · 50kg', done: true },
                    { name: 'Incline Dumbbell', detail: '3×12', done: false },
                    { name: 'Tricep Pushdown', detail: '3×15', done: false },
                  ]}
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-yellow-500 text-sm font-semibold mb-3">
                  <span className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">⚡</span>
                  LIVE TRACKING
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">Track every set in real time</h3>
                <p className="text-slate-400 mb-6">Log reps, weight, and sets as you go. Built-in workout timer so you know exactly how long you've been grinding.</p>
                <ul className="space-y-3">
                  {['Log reps & weight per set', 'Built-in workout timer', 'Mark sets as complete', 'Save full session history'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-72 bg-surface-800 rounded-2xl border border-surface-700 p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-slate-100">Bench Press</p>
                      <p className="text-xs text-slate-500">Chest · Target 4×8</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">24:37</span>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 text-xs text-slate-500 px-1 mb-1">
                      <span>SET</span><span>KG</span><span>REPS</span><span></span>
                    </div>
                    {[
                      { set: 1, kg: '80', reps: '8', done: true },
                      { set: 2, kg: '80', reps: '8', done: true },
                      { set: 3, kg: '82.5', reps: '7', done: true },
                      { set: 4, kg: '82.5', reps: '', done: false },
                    ].map(row => (
                      <div key={row.set} className={`grid grid-cols-4 items-center gap-2 bg-surface-900 rounded-xl px-3 py-2.5 ${row.done ? 'opacity-60' : ''}`}>
                        <span className="text-sm text-slate-400 font-medium">{row.set}</span>
                        <span className="text-sm text-slate-200">{row.kg || <span className="text-slate-600">—</span>}</span>
                        <span className="text-sm text-slate-200">{row.reps || <span className="text-slate-600">—</span>}</span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${row.done ? 'bg-primary-500/20 text-primary-500' : 'bg-surface-700 text-slate-500'}`}>
                          {row.done ? '✓' : '○'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-semibold mb-3">
                  <span className="w-6 h-6 bg-blue-400/20 rounded-lg flex items-center justify-center">📈</span>
                  PROGRESS
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">See your progress every week</h3>
                <p className="text-slate-400 mb-6">Your dashboard shows this week's workouts, recent sessions, and your active program — everything you need at a glance.</p>
                <ul className="space-y-3">
                  {['Weekly workout count', 'Full session history', 'Per-exercise logs', 'Fitness goal tracking'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-5 h-5 bg-blue-400/20 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-72 bg-surface-800 rounded-2xl border border-surface-700 p-5 shadow-xl">
                  <p className="font-bold text-slate-100 mb-4">This Month</p>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['M','T','W','T','F','S','S'].map(d => (
                      <div key={d} className="text-center text-xs text-slate-600">{d}</div>
                    ))}
                    {Array.from({length: 28}).map((_, i) => (
                      <div key={i} className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                        [1,3,5,8,10,12,15,17,19,22,24,26].includes(i)
                          ? 'bg-primary-600 text-white font-bold'
                          : 'bg-surface-900 text-slate-600'
                      }`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-900 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-primary-500">12</p>
                      <p className="text-xs text-slate-500">Workouts</p>
                    </div>
                    <div className="bg-surface-900 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-blue-400">5d</p>
                      <p className="text-xs text-slate-500">Streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-surface-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-4">Get started in 3 steps</h2>
          <p className="text-slate-400 mb-16">From zero to your first logged workout in under 5 minutes.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free in seconds. No credit card, no nonsense.', icon: '👤' },
              { step: '02', title: 'Build your program', desc: 'Create a workout program with your days and exercises.', icon: '📋' },
              { step: '03', title: 'Start logging', desc: 'Hit start, log your sets, finish strong. Repeat.', icon: '🏋️' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative">
                <div className="bg-surface-800 rounded-2xl border border-surface-700 p-8 h-full">
                  <div className="text-4xl mb-4">{icon}</div>
                  <div className="text-xs font-bold text-primary-500 mb-2 tracking-widest">STEP {step}</div>
                  <h3 className="font-bold text-slate-100 text-lg mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100">What athletes say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Alex M.', role: 'Powerlifter', text: 'Finally a tracker that doesn\'t get in the way. Clean, fast, and everything I need to log my lifts.', stars: 5 },
              { name: 'Sarah K.', role: 'Gym enthusiast', text: 'I\'ve tried every app out there. GymPal is the first one I actually stick with because it\'s so simple to use.', stars: 5 },
              { name: 'Marcus T.', role: 'Personal trainer', text: 'I recommend GymPal to all my clients. Building programs is intuitive and logging sessions takes seconds.', stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} className="bg-surface-800 rounded-2xl border border-surface-700 p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-4">"{text}"</p>
                <div>
                  <p className="font-semibold text-slate-100 text-sm">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-600/20 to-primary-800/10 border border-primary-500/20 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-4">Ready to get stronger?</h2>
            <p className="text-slate-400 mb-8">Join thousands of athletes already tracking with GymPal. It's free.</p>
            <Link
              to="/register"
              className="inline-block px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl text-lg transition"
            >
              Start for free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white text-xs">G</div>
            <span className="font-bold text-slate-100">GymPal</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 GymPal. Built for athletes, by athletes.</p>
          <div className="flex gap-6">
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition">Log in</Link>
            <Link to="/register" className="text-xs text-slate-500 hover:text-slate-300 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, subtitle, items }) {
  return (
    <div className="w-72 bg-surface-800 rounded-2xl border border-surface-700 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-slate-100">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="text-xs text-primary-500 bg-primary-500/10 px-2 py-1 rounded-full font-medium">Active</span>
      </div>
      <div className="space-y-2">
        {items.map(({ name, detail, done }) => (
          <div key={name} className="flex items-center gap-3 bg-surface-900 rounded-xl px-3 py-2.5">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'border-primary-500 bg-primary-500' : 'border-surface-600'}`}>
              {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-sm text-slate-300 flex-1">{name}</span>
            <span className="text-xs text-slate-500">{detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
