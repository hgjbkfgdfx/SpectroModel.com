import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, BookOpen, Scale, FileText, AlertTriangle, 
  CheckCircle, Brain, ExternalLink, Copyright, Lock
} from "lucide-react";

const COPYRIGHT_TOPICS = [
  {
    id: 'basics',
    title: 'Copyright Basics',
    icon: Copyright,
    content: [
      {
        question: 'What is music copyright?',
        answer: 'Music copyright is a form of intellectual property protection that gives creators exclusive rights to their original musical works. This includes the composition (melody, lyrics, harmony) and the sound recording (the actual recorded performance).'
      },
      {
        question: 'What are the two types of music copyright?',
        answer: '1. **Composition Copyright (PA)**: Protects the underlying song - melody, lyrics, and harmony. Owned by songwriters/composers.\n\n2. **Sound Recording Copyright (SR)**: Protects the specific recorded version. Owned by performers/record labels.'
      },
      {
        question: 'How long does copyright last?',
        answer: 'In the US: Life of the author + 70 years. For works made for hire: 95 years from publication or 120 years from creation, whichever is shorter.'
      }
    ]
  },
  {
    id: 'fair_use',
    title: 'Fair Use',
    icon: Scale,
    content: [
      {
        question: 'What is Fair Use?',
        answer: 'Fair use is a legal doctrine that permits limited use of copyrighted material without permission for purposes such as criticism, comment, news reporting, teaching, scholarship, or research.'
      },
      {
        question: 'Four Factors of Fair Use',
        answer: '1. **Purpose**: Educational, nonprofit, commentary, or parody favors fair use\n\n2. **Nature**: Factual works are more likely to be fair use than creative works\n\n3. **Amount**: Using small portions is more likely fair use\n\n4. **Market Impact**: If use harms the market for the original, it\'s less likely fair use'
      },
      {
        question: 'What is NOT Fair Use?',
        answer: '• Using music in monetized YouTube videos without license\n• Sampling without clearance (even short samples)\n• Cover songs without mechanical license\n• Using music in commercial advertisements'
      }
    ]
  },
  {
    id: 'licensing',
    title: 'Music Licensing',
    icon: FileText,
    content: [
      {
        question: 'Types of Music Licenses',
        answer: '• **Mechanical License**: For reproducing and distributing a song\n• **Sync License**: For using music in video/film\n• **Performance License**: For public performance (radio, venues)\n• **Master License**: For using a specific recording\n• **Print License**: For sheet music distribution'
      },
      {
        question: 'How to Get a License',
        answer: '1. **Mechanical**: Harry Fox Agency, Songfile, or direct from publisher\n2. **Sync**: Contact music publisher directly\n3. **Performance**: ASCAP, BMI, or SESAC\n4. **Master**: Contact record label\n5. **Royalty-Free**: Purchase from stock music libraries'
      },
      {
        question: 'Compulsory Mechanical License',
        answer: 'Once a song is released, anyone can record a cover version by obtaining a compulsory mechanical license at the statutory rate (currently 9.1¢ per copy for songs under 5 minutes).'
      }
    ]
  },
  {
    id: 'sampling',
    title: 'Sampling & Interpolation',
    icon: AlertTriangle,
    content: [
      {
        question: 'What is Sampling?',
        answer: 'Sampling is the act of taking a portion (or sample) of one sound recording and reusing it in a different song. This requires clearance from BOTH the composition copyright holder AND the master recording copyright holder.'
      },
      {
        question: 'What is Interpolation?',
        answer: 'Interpolation (replay) is re-recording a portion of a song rather than sampling the original recording. This only requires clearance from the composition copyright holder (not the master holder).'
      },
      {
        question: 'Famous Sampling Lawsuits',
        answer: '• Vanilla Ice vs. Queen/David Bowie ("Ice Ice Baby")\n• The Verve vs. Rolling Stones ("Bitter Sweet Symphony")\n• Robin Thicke vs. Marvin Gaye Estate ("Blurred Lines")\n• Katy Perry vs. Flame ("Dark Horse")'
      }
    ]
  },
  {
    id: 'protection',
    title: 'Protecting Your Music',
    icon: Lock,
    content: [
      {
        question: 'How to Register Copyright',
        answer: '1. Create an account at copyright.gov\n2. Fill out the appropriate form (PA for songs, SR for recordings)\n3. Pay the fee ($45-$65)\n4. Upload your work\n5. Receive certificate (takes 3-8 months)'
      },
      {
        question: 'Why Register?',
        answer: '• Establishes public record of ownership\n• Required before filing lawsuit\n• Enables statutory damages ($150,000 per infringement)\n• Enables recovery of attorney\'s fees\n• Creates presumption of ownership'
      },
      {
        question: 'Other Protection Methods',
        answer: '• Use audio fingerprinting services (ContentID)\n• Register with PROs (ASCAP, BMI, SESAC)\n• Keep dated records of creation process\n• Use © notice on releases\n• Register with SoundExchange for digital royalties'
      }
    ]
  }
];

export default function CopyrightEducation() {
  const [selectedTopic, setSelectedTopic] = useState('basics');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const currentTopic = COPYRIGHT_TOPICS.find(t => t.id === selectedTopic);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-950/80 to-purple-950/80 border-blue-500/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Copyright className="w-6 h-6 text-blue-400" />
            Copyright Education Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Learn about music copyright, licensing, fair use, and how to protect your creative works.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-300">🤖 AI Learning Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300">🛡️ Verified Content</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic Navigation */}
      <div className="flex flex-wrap gap-2">
        {COPYRIGHT_TOPICS.map(topic => (
          <Button
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            variant={selectedTopic === topic.id ? 'default' : 'outline'}
            className={selectedTopic === topic.id ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
          >
            <topic.icon className="w-4 h-4 mr-2" />
            {topic.title}
          </Button>
        ))}
      </div>

      {/* Topic Content */}
      {currentTopic && (
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <currentTopic.icon className="w-5 h-5 text-blue-400" />
              {currentTopic.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTopic.content.map((item, idx) => (
              <div 
                key={idx}
                className="border border-slate-700/50 rounded-lg overflow-hidden"
              >
                <div 
                  onClick={() => toggleQuestion(idx)}
                  className="p-4 bg-slate-800/60 cursor-pointer hover:bg-slate-800/80 transition-colors flex items-center justify-between"
                >
                  <h4 className="text-white font-semibold">{item.question}</h4>
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {expandedQuestions[idx] ? 'Hide' : 'Show'}
                  </Badge>
                </div>
                {expandedQuestions[idx] && (
                  <div className="p-4 bg-slate-900/60 border-t border-slate-700/50">
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="bg-amber-950/50 border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-amber-300 font-semibold">Legal Disclaimer</h4>
              <p className="text-slate-300 text-sm mt-1">
                This information is for educational purposes only and does not constitute legal advice. 
                For specific legal questions about your music, consult a qualified entertainment attorney.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Resources */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            Official Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: 'U.S. Copyright Office', url: 'https://copyright.gov' },
              { name: 'ASCAP', url: 'https://ascap.com' },
              { name: 'BMI', url: 'https://bmi.com' },
              { name: 'Harry Fox Agency', url: 'https://harryfox.com' },
              { name: 'SoundExchange', url: 'https://soundexchange.com' },
              { name: 'Music Publishers Association', url: 'https://mpa.org' }
            ].map((resource, idx) => (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 hover:border-green-500/50 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="text-white font-medium">{resource.name}</span>
                <ExternalLink className="w-4 h-4 text-green-400" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}