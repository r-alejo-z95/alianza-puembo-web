"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlock from "@tiptap/extension-code-block";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CodeSquare,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RichTextEditor = ({ content, onChange, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--puembo-green)] underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      CodeBlock,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "dark:prose-invert max-w-none focus:outline-none p-4 min-h-[250px] leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  // Manejar la inserción de enlaces
  const toggleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL del enlace:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("flex flex-col max-w-full overflow-hidden", className)}>
      {/* Sticky & Scrollable Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-0.5 p-2 border-b bg-white/80 backdrop-blur-md overflow-x-auto no-scrollbar scroll-smooth max-w-full">
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Bold className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Italic className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
          <Toggle
            size="sm"
            pressed={editor.isActive("link")}
            onPressedChange={toggleLink}
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("codeBlock")}
            onPressedChange={() =>
              editor.chain().focus().toggleCodeBlock().run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <CodeSquare className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <List className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Quote className="h-3.5 w-3.5" />
          </Toggle>
        </div>

        <div className="flex items-center gap-0.5 pl-2">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
            className="h-8 w-8 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Toggle>
        </div>
      </div>
      <div className="flex-grow bg-white rounded-2xl">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
