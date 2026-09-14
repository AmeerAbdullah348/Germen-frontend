import { Link, useParams } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import Button from '../components/ui/Button'
import { GRAMMAR_TOPICS_BY_ID } from '../data/grammar'

export default function GrammarTopic() {
  const { topicId } = useParams()
  const topic = GRAMMAR_TOPICS_BY_ID[topicId]

  if (!topic) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-gray-600">This topic couldn't be loaded.</p>
        <Link to="/grammar" className="text-primary-600 font-medium">
          Back to Grammar
        </Link>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-10">
      <div>
        <Link to="/grammar" className="text-sm text-gray-400">
          &larr; Grammar
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mt-1">{topic.title}</h1>
      </div>

      <div className="text-gray-700 leading-relaxed">
        <ChatMessage text={topic.explanation} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-500">Examples</h2>
        {topic.examples.map((example, i) => (
          <div key={i} className="rounded-xl bg-white border border-gray-200 px-4 py-3">
            <p className="font-medium text-gray-900">{example.de}</p>
            <p className="text-sm text-gray-500">{example.en}</p>
          </div>
        ))}
      </div>

      <Button as={Link} to={`/grammar/${topic.id}/practice`}>
        Start exercises
      </Button>
    </div>
  )
}
