import React from 'react';
import '../styles/components/_faq.scss'
 
// function that displays faq questions and answers
function FAQ({faq,index, toggleFAQ}){
    return (
        <div className = {'faq '+(faq.open?'open':'')}
        key={index}
        onClick = {() => toggleFAQ(index)}>
            <div className='faq-question'>
                {faq.question}
            </div>
            <div className = 'faq-answer'>
                {faq.answer}
            </div>
        </div>
    )
}
export default FAQ