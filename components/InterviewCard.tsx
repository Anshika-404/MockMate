import React from 'react'
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import DisplayTechicons from './DisplayTechicons';

import { getInterviewCover } from '@/lib/utils'
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

type Feedback = {
  createdAt: string | number | Date;
  // add other fields as needed
};

type InterviewCardprops = {
  id: string;
  userid: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string | number | Date;
};

const InterviewCard = ({ id, userid, role, type,
     techstack, createdAt }: InterviewCardprops) => {
        const feedback = null as Feedback | null;
        const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
        const formattedDate = dayjs(feedback?.createdAt || createdAt || 
            Date.now()).format('DD MMM, YYYY');
        
  return (
    <div className="card-border w-[360px] max-sm:w-full
    min-h-96">
        <div className="card-interview">
            <div>
                <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
                    <p className="badge-text">{normalizedType}</p>
                </div>
                <Image src={getInterviewCover(id)} alt="cover image" width={90} height={90} />


                <h3 className="mt-5 capitalize">
                    {role} Interview
                </h3>

                <div className="flex flex-row gap-5 mt-3">
                    <div className="flex flex-row gap-2">
                          <Image src="/calendar.svg" alt="calendar" 
                          width={22} height={22} />
                          <p>{formattedDate}</p>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" alt="star" width={22} height={22}/>
                        <p>{feedback?.totalScore || '---'}/100</p>

                    </div>
                </div>

                <p className="line-clamp-2 mt-5">
                    {feedback ?.finalAssessment || 
                    "You haven't taken the interview yet. Take it now to improve your skills!"}
                </p>
             </div>

             <div className="flex flex-row justify-between">
                <DisplayTechicons techStack={techstack} />
                
                <Button className="btn-primary">
                    <Link href={feedback ?
                        '/interview/${id}/feedback'
                        : '/interview/${id}'
                    }>
                        {feedback ?'Check feedback' : 'View'}
                    </Link>
                </Button>

             </div>
        </div>
    </div>
  )
}

export default InterviewCard
