import React from 'react';
import { Sparkles, Target, Layers } from 'lucide-react';

// Helper to parse bold text
function parseBoldText(text) {
  if (!text) return null;
  
  const parts = [];
  let currentText = '';
  let i = 0;
  
  while (i < text.length) {
    if (text[i] === '*' && text[i + 1] === '*') {
      // Found opening **
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      
      i += 2; // Skip **
      let boldText = '';
      
      // Find closing **
      while (i < text.length - 1) {
        if (text[i] === '*' && text[i + 1] === '*') {
          parts.push(<strong key={parts.length} className="font-bold text-slate-100">{boldText}</strong>);
          i += 2; // Skip closing **
          break;
        }
        boldText += text[i];
        i++;
      }
    } else {
      currentText += text[i];
      i++;
    }
  }
  
  if (currentText) {
    parts.push(currentText);
  }
  
  return parts.length > 0 ? parts : text;
}

// Helper to render markdown tables
function renderTable(tableLines, keyBase) {
  if (tableLines.length < 2) return null;

  // Parse table
  const rows = tableLines.map(line => {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell !== '');
  });

  if (rows.length === 0) return null;

  // First row is headers
  const headers = rows[0];
  
  // Second row might be separator (|---|---|), skip it
  let dataStartIndex = 1;
  if (rows.length > 1 && rows[1].every(cell => /^[-:]+$/.test(cell))) {
    dataStartIndex = 2;
  }

  const dataRows = rows.slice(dataStartIndex);

  return (
    <div key={`table-${keyBase}`} className="overflow-x-auto my-4">
      <table className="min-w-full border border-slate-600 rounded-lg overflow-hidden">
        <thead className="bg-slate-700/50">
          <tr>
            {headers.map((header, i) => (
              <th
                key={`th-${i}`}
                className="px-4 py-2 text-left text-sm font-semibold text-slate-200 border-b border-slate-600"
              >
                {parseBoldText(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {dataRows.map((row, rowIdx) => (
            <tr key={`tr-${rowIdx}`} className="hover:bg-slate-700/30 transition-colors">
              {row.map((cell, cellIdx) => (
                <td
                  key={`td-${rowIdx}-${cellIdx}`}
                  className="px-4 py-2 text-sm text-slate-300"
                >
                  {parseBoldText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Simple markdown-like formatter for the content
function formatContent(text) {
  // Replace common field labels with line breaks
  const labelPatterns = [
    /\s+(Original Excerpt:)/g,
    /\s+(Technique Label:)/g,
    /\s+(Enhanced Delivery Script:)/g,
    /\s+(Balanced Judgment:)/g,
    /\s+(Strategic Value:)/g,
    /\s+(Ethical Consideration:)/g,
    /\s+(Context:)/g,
    /\s+(Analysis:)/g,
    /\s+(Recommendation:)/g,
    /\s+(Impact:)/g
  ];
  
  labelPatterns.forEach(pattern => {
    text = text.replace(pattern, '\n\n**$1**\n');
  });

  const lines = text.split('\n');
  const elements = [];
  let currentParagraph = [];
  let listItems = [];
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let tableLines = [];
  let inTable = false;

  lines.forEach((line, idx) => {
    const trimmedLine = line.trim();

    // Check if this is a table line (contains pipes)
    if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
      // Flush any pending content
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300 leading-relaxed">{currentParagraph}</p>);
        currentParagraph = [];
      }
      if (inList && listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        const listClass = listType === 'ol' ? 'list-decimal list-inside mb-4 space-y-2 ml-4' : 'list-disc list-inside mb-4 space-y-2';
        elements.push(<ListTag key={`list-${elements.length}`} className={listClass}>{listItems}</ListTag>);
        listItems = [];
        inList = false;
        listType = null;
      }

      // Add to table buffer
      inTable = true;
      tableLines.push(trimmedLine);
      return;
    } else if (inTable && tableLines.length > 0) {
      // End of table - render it
      const tableElement = renderTable(tableLines, elements.length);
      if (tableElement) {
        elements.push(tableElement);
      }
      tableLines = [];
      inTable = false;
    }

    // Skip empty lines in certain contexts
    if (trimmedLine === '') {
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300 leading-relaxed">{currentParagraph}</p>);
        currentParagraph = [];
      }
      if (inList && listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        const listClass = listType === 'ol' ? 'list-decimal list-inside mb-4 space-y-2 ml-4' : 'list-disc list-inside mb-4 space-y-2';
        elements.push(<ListTag key={`list-${elements.length}`} className={listClass}>{listItems}</ListTag>);
        listItems = [];
        inList = false;
        listType = null;
      }
      return;
    }

    // Headers (##, ###, etc.)
    if (trimmedLine.startsWith('###')) {
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300">{currentParagraph}</p>);
        currentParagraph = [];
      }
      if (inList && listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        const listClass = listType === 'ol' ? 'list-decimal list-inside mb-4 space-y-2 ml-4' : 'list-disc list-inside mb-4 space-y-2';
        elements.push(<ListTag key={`list-${elements.length}`} className={listClass}>{listItems}</ListTag>);
        listItems = [];
        inList = false;
        listType = null;
      }
      const headerText = trimmedLine.replace(/^###\s*/, '');
      elements.push(<h3 key={`h3-${idx}`} className="text-xl font-bold text-emerald-400 mt-6 mb-3">{parseBoldText(headerText)}</h3>);
    } else if (trimmedLine.startsWith('##')) {
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300">{currentParagraph}</p>);
        currentParagraph = [];
      }
      if (inList && listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        const listClass = listType === 'ol' ? 'list-decimal list-inside mb-4 space-y-2 ml-4' : 'list-disc list-inside mb-4 space-y-2';
        elements.push(<ListTag key={`list-${elements.length}`} className={listClass}>{listItems}</ListTag>);
        listItems = [];
        inList = false;
        listType = null;
      }
      const headerText = trimmedLine.replace(/^##\s*/, '');
      elements.push(<h2 key={`h2-${idx}`} className="text-2xl font-bold text-blue-400 mt-6 mb-4">{parseBoldText(headerText)}</h2>);
    }
    // Standalone bold line (heading-style)
    else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.indexOf('**', 2) === trimmedLine.length - 2) {
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300">{currentParagraph}</p>);
        currentParagraph = [];
      }
      if (inList && listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        const listClass = listType === 'ol' ? 'list-decimal list-inside mb-4 space-y-2 ml-4' : 'list-disc list-inside mb-4 space-y-2';
        elements.push(<ListTag key={`list-${elements.length}`} className={listClass}>{listItems}</ListTag>);
        listItems = [];
        inList = false;
        listType = null;
      }
      elements.push(<h4 key={`h4-${idx}`} className="text-lg font-bold text-slate-100 mt-4 mb-2">{trimmedLine.replace(/\*\*/g, '')}</h4>);
    }
    // Bullet list items (- or *)
    else if (trimmedLine.match(/^[-*]\s/)) {
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300">{currentParagraph}</p>);
        currentParagraph = [];
      }
      if (inList && listType === 'ol') {
        elements.push(<ol key={`list-${elements.length}`} className="list-decimal list-inside mb-4 space-y-2 ml-4">{listItems}</ol>);
        listItems = [];
      }
      inList = true;
      listType = 'ul';
      const content = trimmedLine.replace(/^[-*]\s/, '');
      listItems.push(<li key={`li-${idx}`} className="text-slate-300">{parseBoldText(content)}</li>);
    }
    // Numbered lists
    else if (trimmedLine.match(/^\d+\.\s/)) {
      if (currentParagraph.length > 0) {
        elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300">{currentParagraph}</p>);
        currentParagraph = [];
      }
      if (inList && listType === 'ul') {
        elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 space-y-2">{listItems}</ul>);
        listItems = [];
      }
      inList = true;
      listType = 'ol';
      const content = trimmedLine.replace(/^\d+\.\s/, '');
      listItems.push(<li key={`li-${idx}`} className="text-slate-300">{parseBoldText(content)}</li>);
    }
    // Regular text - add to current paragraph
    else {
      if (inList && listItems.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        const listClass = listType === 'ol' ? 'list-decimal list-inside mb-4 space-y-2 ml-4' : 'list-disc list-inside mb-4 space-y-2';
        elements.push(<ListTag key={`list-${elements.length}`} className={listClass}>{listItems}</ListTag>);
        listItems = [];
        inList = false;
        listType = null;
      }
      
      const parsed = parseBoldText(trimmedLine);
      if (Array.isArray(parsed)) {
        currentParagraph.push(...parsed);
      } else {
        currentParagraph.push(parsed);
      }
      currentParagraph.push(' ');
    }
  });

  // Flush remaining content
  if (currentParagraph.length > 0) {
    elements.push(<p key={`p-${elements.length}`} className="mb-4 text-slate-300 leading-relaxed">{currentParagraph}</p>);
  }
  if (inList && listItems.length > 0) {
    const ListTag = listType === 'ol' ? 'ol' : 'ul';
    const listClass = listType === 'ol' ? 'list-decimal list-inside mb-4 space-y-2 ml-4' : 'list-disc list-inside mb-4 space-y-2';
    elements.push(<ListTag key={`list-${elements.length}`} className={listClass}>{listItems}</ListTag>);
  }
  // Flush any remaining table
  if (inTable && tableLines.length > 0) {
    const tableElement = renderTable(tableLines, elements.length);
    if (tableElement) {
      elements.push(tableElement);
    }
  }

  return elements;
}

export default function AnalysisCard({ analysis, index }) {
  // Determine card styling based on layer type
  const isSynthesis = analysis.id === 'synthesis';
  const isLayer = analysis.id.startsWith('layer');
  
  // Different colors for different layer groups
  const getLayerGroup = () => {
    if (isSynthesis) return 'synthesis';
    if (['layer1', 'layer2', 'layer3'].includes(analysis.id)) return 'linguistic'; // Phonetic, Lexical, Syntactic
    if (['layer4', 'layer5'].includes(analysis.id)) return 'semantic'; // Semantic, Pragmatic
    if (['layer6', 'layer7', 'layer8'].includes(analysis.id)) return 'rhetorical'; // Classical, Cognitive, Meta
    if (analysis.id === 'layer9') return 'affective'; // Affective & Mnemonic
    return 'default';
  };
  
  const layerGroup = getLayerGroup();
  
  const getBorderColor = () => {
    if (isSynthesis) return 'border-blue-500/50';
    if (layerGroup === 'linguistic') return 'border-emerald-500/50';
    if (layerGroup === 'semantic') return 'border-purple-500/50';
    if (layerGroup === 'rhetorical') return 'border-orange-500/50';
    if (layerGroup === 'affective') return 'border-pink-500/50';
    return 'border-slate-600';
  };
  
  const getIcon = () => {
    if (isSynthesis) return <Target className="w-5 h-5 text-blue-400" />;
    return <Layers className="w-5 h-5 text-slate-400" />;
  };
  
  const getHeaderGradient = () => {
    if (isSynthesis) return 'from-blue-500/10 to-transparent';
    if (layerGroup === 'linguistic') return 'from-emerald-500/10 to-transparent';
    if (layerGroup === 'semantic') return 'from-purple-500/10 to-transparent';
    if (layerGroup === 'rhetorical') return 'from-orange-500/10 to-transparent';
    if (layerGroup === 'affective') return 'from-pink-500/10 to-transparent';
    return 'from-slate-700/30 to-transparent';
  };

  return (
    <div
      id={`analysis-card-${index}`}
      className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border ${getBorderColor()} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fadeIn`}
    >
      <div className={`bg-gradient-to-r ${getHeaderGradient()} p-4 -m-6 mb-4 rounded-t-lg border-b border-slate-700`}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <h3 className="text-lg font-semibold text-slate-100">
            {analysis.title}
          </h3>
        </div>
      </div>
      
      <div className="prose prose-invert prose-slate max-w-none">
        <div className="text-slate-300 leading-relaxed">
          {formatContent(analysis.content)}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <span>Step {index + 1}</span>
        <span>{new Date(analysis.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
