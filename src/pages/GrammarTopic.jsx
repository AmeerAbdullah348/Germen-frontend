import { Link, useParams } from 'react'
import ChatMessage from '../components/ChatMessage'
import Button from '../components/ui/Button'
import { GRAMMAR_TOPICS_BY_ID } from '../data/grammar'

export default function GrammarTopic() {
  const { topicId } = useParams()
  const topic = GRAMMAR_TOPICS_BY_ID[topicId]

  if (!topic) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-svh bg-[#070b19]">
        <p className="text-slate-400">This topic couldn't be loaded.</p>
        <Link to="/grammar" className="text-cyan-400 font-bold hover:underline">
          Back to Grammar
        </Link>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-10 text-slate-100">
      <div>
        <Link to="/grammar" className="text-xs text-slate-400 hover:text-white font-medium">
          &larr; Back to Grammar
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">{topic.title}</h1>
      </div>

      <div className="text-slate-200 leading-relaxed rounded-2xl bg-slate-900/90 border border-white/10 p-5 backdrop-blur-xl shadow-xl">
        <ChatMessage text={topic.explanation} />
      </div>

      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Examples</h2>
        {topic.examples.map((example, i) => (
          <div key={i} className="rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 shadow-md">
            <p className="font-bold text-white text-sm">{example.de}</p>
            <p className="text-xs text-slate-400">{example.en}</p>
          </div>
        ))}
      </div>

      <Button as={Link} to={`/grammar/${topic.id}/practice`}>
        Start exercises
      </Button>
    </div>
  )
}
