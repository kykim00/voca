import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// State
type Quiz = {
  index: number
  text: string // 문제
  answer: string // 정답
  selections: string[] // 보기 목록 (정답 포함), 2지 선다
}

type QuizResult = {
  quizIndex: number
  createdAt: Date
  answer: string // 정답
  selected: string // 선택한 답
  isCorrect: boolean // 정답여부
}

type State = {
  isCompleted: boolean // computed
  correctCount: number // computed
  inCorrectCount: number // computed
  currentIndex: number // computed
  quizList: Quiz[]
  quizResults: QuizResult[]
}

// Action

// Select 동작방식
// 선지를 선택하면, 새로운 퀴즈결과가 생기고,
// 다음 문제로 넘어가야 한다.
type Select = {
  type: 'SELECT'
  payload: {
    quizIndex: number
    selected: string
  }
}

type Action = Select

function quizSessionReducer(state: State, action: Action) {
  // TODO
  // 선택한 선지에 따라
  // state 값이 변경되어야 함.
  // 예를 들어, 퀴즈 결과가 생성되고
  // 맞은 혹은 틀린 개수가 업데이트 되고,
  // 다음 퀴즈로 넘어가야 함.
  const { quizIndex, selected } = action.payload
  const isCorrect = state.quizList[quizIndex].answer === selected
  const isComplete = state.quizList.length === state.quizResults.length + 1
  const newState = {
    ...state,
    isCompleted: isComplete,
    correctCount: state.correctCount + (isCorrect ? 1 : 0),
    inCorrectCount: state.inCorrectCount + (isCorrect ? 0 : 1),
    currentIndex: state.currentIndex + 1,
    quizResults: [
      ...state.quizResults,
      {
        quizIndex,
        createdAt: new Date(),
        answer: state.quizList[quizIndex].answer,
        selected,
        isCorrect: isCorrect
      }
    ]
  }

  return newState
}

// View
function QuizSessionView(state: State, onClick: (selected: string) => void) {
  function QuizView(quiz: Quiz) {
    const articleStyle = {
      marginTop: '16px',
      padding: '8px',
      background: '#efefef'
    }
    return (
      <article style={articleStyle}>
        <header>{quiz.text}</header>
        {quiz.selections.map((sel, idx) => {
          return (
            <button key={idx} onClick={() => onClick(sel)}>
              {sel}
            </button>
          )
        })}
      </article>
    )
  }

  const currentQuiz = state.quizList[state.currentIndex]

  return (
    <section>
      <div>완료 여부: {state.isCompleted ? '완료' : '미완료'}</div>
      <div>
        {state.quizResults.length} / {state.quizList.length}
      </div>
      {state.isCompleted ? (
        <>
          <div>맞은 개수 {state.correctCount}</div>
          <div>틀린 개수 {state.inCorrectCount}</div>
          <div>
            <p>틀린 문제</p>
            {state.quizResults
              .filter((result) => !result.isCorrect)
              .map((quiz) => (
                <span key={quiz.quizIndex}>{state.quizList[quiz.quizIndex].text} </span>
              ))}
          </div>
          <Link to='/'>홈으로</Link>
        </>
      ) : (
        QuizView(currentQuiz)
      )}
    </section>
  )
}

function QuizSession() {
  const [initalLoaded, setInitalLoaded] = useState(false)
  const [state, setState] = useState<State | null>(null)

  const initState: () => Promise<State> = async () => {
    // 임시로 1초간 타임 아웃.
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const initialData = [
      {
        text: 'apple',
        meaning: 'a. 사과'
      },
      {
        text: 'brick',
        meaning: 'n. 벽돌'
      },
      {
        text: 'completion',
        meaning: 'n. 완성, 성취'
      },
      {
        text: 'obstacle',
        meaning: 'n. 장애물'
      },
      {
        text: 'horn',
        meaning: 'n. 뿔, 경적'
      },
      {
        text: 'dough',
        meaning: 'n. 밀가루 반죽'
      },
      {
        text: 'leap',
        meaning: 'v. 뛰다, 급증하다.'
      },
      {
        text: 'pearl',
        meaning: 'n. 진주, 진주색'
      },
      {
        text: 'tourism',
        meaning: 'n. 관광, 관광 사업'
      },
      {
        text: 'persisent',
        meaning: 'a. 지속적인, 끈질긴'
      }
    ]
    // TODO
    // initialData를 State 타입으로 변경 후 리턴한다.
    // quizList[].selections 을 만드는 조건은
    // 해당 단어의 뜻 하나와 다른 단어의 뜻 둘을 포함하여
    // 3지 선다형 뜻 찾기 문제 보기로 변환한다.
    // 아래 데이터는 예시 데이터이므로 삭제.
    const getRandomNumber = (index: number, max: number) => {
      while (true) {
        const randNumA = Math.floor(Math.random() * max)
        const randNumB = Math.floor(Math.random() * max)

        if (randNumA !== randNumB && randNumA !== index && randNumB !== index) {
          return [randNumA, randNumB]
        }
      }
    }

    const initialState: State = {
      isCompleted: false,
      correctCount: 0,
      inCorrectCount: 0,
      currentIndex: 0,
      quizList: initialData.map((quiz, idx) => {
        const [randNumA, randNumB] = getRandomNumber(idx, initialData.length)
        return {
          index: idx,
          text: quiz.text,
          answer: quiz.meaning,
          selections: [
            quiz.meaning,
            initialData[randNumA].meaning,
            initialData[randNumB].meaning
          ].sort(() => Math.random() - 0.5)
        }
      }),
      quizResults: []
    }

    setState(initialState)
    return initialState
  }

  useEffect(() => {
    ;(async () => {
      // 초기 데이터 불러오기
      if (!initalLoaded) {
        const initalState = await initState()
        setState(initalState)
        setInitalLoaded(true)
      }
    })()
  }, [initalLoaded])

  const quizSelected = (selected: string) => {
    if (state == null) return

    const newState = quizSessionReducer(state, {
      type: 'SELECT',
      payload: {
        quizIndex: state.currentIndex,
        selected: selected
      }
    })
    setState(newState)
  }

  return <div>{state ? QuizSessionView(state, quizSelected) : '로딩중...'}</div>
}

export default QuizSession
