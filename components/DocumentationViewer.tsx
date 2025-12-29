
import { useEffect, useState, type FC } from 'react';

export const DocumentationViewer: FC = () => {
    const [content, setContent] = useState('');

    useEffect(() => {
        fetch('/APP_DOCUMENTATION.md')
            .then(res => res.text())
            .then(text => setContent(text))
            .catch(err => setContent('# Error loading documentation\nMake sure APP_DOCUMENTATION.md is in the public folder.'));
    }, []);

    // Simple parser: Split by double newline for paragraphs, check for # for headers
    const renderMarkdown = (text: string) => {
        return text.split('\n\n').map((block, index) => {
            if (block.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-bold text-purple-300 mt-6 mb-2">{block.replace('### ', '')}</h3>;
            }
            if (block.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold text-teal-400 mt-8 mb-4 border-b border-white/10 pb-2">{block.replace('## ', '')}</h2>;
            }
            if (block.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">{block.replace('# ', '')}</h1>;
            }
            if (block.startsWith('* ')) {
                // Formatting bullet lists
                return (
                    <ul key={index} className="list-disc pl-5 space-y-1 text-gray-300">
                        {block.split('\n').map((line, i) => (
                            <li key={i}>{line.replace('* ', '')}</li>
                        ))}
                    </ul>
                );
            }
            return <p key={index} className="text-gray-300 leading-relaxed mb-4 whitespace-pre-line">{block}</p>;
        });
    };

    return (
        <div className="flex-grow overflow-y-auto p-8 bg-gray-950">
            <div className="max-w-4xl mx-auto bg-gray-900/50 p-8 rounded-2xl border border-white/5 shadow-2xl">
                <article className="prose prose-invert max-w-none">
                    {renderMarkdown(content)}
                </article>
            </div>
        </div>
    );
};
