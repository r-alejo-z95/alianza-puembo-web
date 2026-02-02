"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CodeSquare,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Type,
  RemoveFormatting,
  Unlink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Helper para limpiar la visualización de la URL
const getDisplayUrl = (url) => {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
};

const ToolbarButton = ({ title, children, pressed, ...props }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Toggle
        type="button"
        size="sm"
        pressed={pressed}
        className={cn(
          "h-9 w-9 md:h-8 md:w-8 rounded-lg shrink-0 transition-all duration-200",
          pressed
            ? "bg-[var(--puembo-green)]/20 text-[var(--puembo-green)] border border-[var(--puembo-green)]/30 scale-105"
            : "text-gray-500 hover:bg-gray-100",
        )}
        {...props}
      >
        {children}
      </Toggle>
    </TooltipTrigger>
    <TooltipContent
      side="top"
      className="hidden md:block text-[10px] font-bold uppercase tracking-widest bg-black text-white border-none shadow-xl"
    >
      {title}
    </TooltipContent>
  </Tooltip>
);

const RichTextEditor = ({
  content,
  onChange,
  className,
  placeholder = "Escribe algo increíble...",
}) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const isUpdatingRef = useRef(false);
  const [editorState, setEditorState] = useState(0); // Para forzar re-render
  const [bubbleMenuVisible, setBubbleMenuVisible] = useState(false);
  const [bubbleMenuPosition, setBubbleMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class:
            "text-[var(--puembo-green)] underline cursor-pointer font-medium",
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class:
            "rounded-xl bg-gray-900 text-gray-100 p-5 font-mono text-sm my-6 shadow-inner",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      onChange(editor.getHTML());
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    },
    onSelectionUpdate: ({ editor }) => {
      // Forzar re-render cuando cambia la selección para actualizar botones
      setEditorState((prev) => prev + 1);
      updateBubbleMenuPosition(editor);
    },
    onTransaction: ({ editor }) => {
      // Forzar re-render en cada transacción para actualizar botones inmediatamente
      setEditorState((prev) => prev + 1);
      updateBubbleMenuPosition(editor);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[250px] p-6 tiptap-editor",
      },
    },
  });

  // Función para actualizar la posición del bubble menu
  const updateBubbleMenuPosition = useCallback((editor) => {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const { from, to, empty } = selection;

    // No mostrar si no hay selección o si estamos en un bloque de código
    if (empty || editor.isActive("codeBlock")) {
      setBubbleMenuVisible(false);
      return;
    }

    // Obtener la posición del texto seleccionado
    const { view } = editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // Calcular posición centrada arriba de la selección
    const left = (start.left + end.left) / 2;
    const top = start.top - 60; // 60px arriba de la selección

    setBubbleMenuPosition({ top, left });
    setBubbleMenuVisible(true);
  }, []);

  // Helper para verificar estado activo incluyendo marcas en espera (storedMarks)
  const isActionActive = (name, attributes = {}) => {
    if (!editor) return false;

    // Primero verificar si está activo en la selección actual
    if (editor.isActive(name, attributes)) return true;

    // Luego verificar storedMarks (marcas pendientes para la próxima escritura)
    const storedMarks = editor.state.storedMarks;
    if (storedMarks) {
      const hasMark = storedMarks.some((mark) => {
        if (typeof name === "object") {
          // Para casos como textAlign que pasan objetos como nombre
          return Object.keys(name).every(
            (key) => mark.attrs && mark.attrs[key] === name[key],
          );
        }
        return mark.type.name === name;
      });
      if (hasMark) return true;
    }

    return false;
  };

  useEffect(() => {
    if (editor && content !== editor.getHTML() && !isUpdatingRef.current) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let url = linkUrl.trim();
      if (
        !/^https?:\/\//i.test(url) &&
        !url.startsWith("mailto:") &&
        !url.startsWith("tel:")
      ) {
        url = `https://${url}`;
      }

      if (editor.state.selection.empty) {
        // Limpiamos la URL para mostrarla bonita
        const displayUrl = getDisplayUrl(url);
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${displayUrl}</a> `)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    }
    setIsLinkPopoverOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
    setIsLinkPopoverOpen(false);
  }, [editor]);

  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "relative flex flex-col w-full border border-gray-100 rounded-[2rem] bg-white transition-all focus-within:ring-4 focus-within:ring-[var(--puembo-green)]/10 focus-within:border-[var(--puembo-green)]/30 overflow-visible",
          className,
        )}
      >
        {/* Custom Bubble Menu - Portal para posicionamiento correcto */}
        {bubbleMenuVisible &&
          typeof window !== "undefined" &&
          createPortal(
            <div
              style={{
                position: "fixed",
                top: `${bubbleMenuPosition.top}px`,
                left: `${bubbleMenuPosition.left}px`,
                transform: "translateX(-50%)",
                zIndex: 999999,
                pointerEvents: "auto",
              }}
            >
              <TooltipProvider delayDuration={300}>
                <div className="flex items-center gap-0.5 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        type="button"
                        size="sm"
                        pressed={isActionActive("bold")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleBold().run()
                        }
                        className={cn(
                          "h-10 w-10 md:h-9 md:w-9 rounded-xl transition-colors",
                          isActionActive("bold")
                            ? "bg-[var(--puembo-green)]/20 text-[var(--puembo-green)]"
                            : "hover:bg-gray-50",
                        )}
                      >
                        <Bold className="h-4 w-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-[10px] font-bold uppercase tracking-widest bg-black text-white border-none shadow-xl z-[9999999]"
                    >
                      Negrita
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        type="button"
                        size="sm"
                        pressed={isActionActive("italic")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                        className={cn(
                          "h-10 w-10 md:h-9 md:w-9 rounded-xl transition-colors",
                          isActionActive("italic")
                            ? "bg-[var(--puembo-green)]/20 text-[var(--puembo-green)]"
                            : "hover:bg-gray-50",
                        )}
                      >
                        <Italic className="h-4 w-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-[10px] font-bold uppercase tracking-widest bg-black text-white border-none shadow-xl z-[9999999]"
                    >
                      Itálica
                    </TooltipContent>
                  </Tooltip>

                  <div className="w-px h-5 bg-gray-100 mx-1" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setLinkUrl(editor.getAttributes("link").href || "");
                          setIsLinkPopoverOpen(true);
                        }}
                        className={cn(
                          "h-10 w-10 md:h-9 md:w-9 rounded-xl",
                          isActionActive("link") &&
                            "bg-green-50 text-[var(--puembo-green)]",
                        )}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-[10px] font-bold uppercase tracking-widest bg-black text-white border-none shadow-xl z-[9999999]"
                    >
                      Enlace
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>,
            document.body,
          )}

        {/* Toolbar Principal */}
        <div className="sticky top-0 z-20 flex items-center gap-1 p-3 border-b border-gray-50 bg-white/80 backdrop-blur-xl rounded-t-[2rem] overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-0.5 pr-3 border-r border-gray-100 shrink-0">
            <ToolbarButton
              title="Título Grande"
              pressed={isActionActive("heading", { level: 2 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Título Mediano"
              pressed={isActionActive("heading", { level: 3 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Texto Párrafo"
              pressed={isActionActive("paragraph")}
              onPressedChange={() =>
                editor.chain().focus().setParagraph().run()
              }
            >
              <Type className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 px-3 border-r border-gray-100 shrink-0">
            <ToolbarButton
              title="Negrita"
              pressed={isActionActive("bold")}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Itálica"
              pressed={isActionActive("italic")}
              onPressedChange={() =>
                editor.chain().focus().toggleItalic().run()
              }
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Subrayado"
              pressed={isActionActive("underline")}
              onPressedChange={() =>
                editor.chain().focus().toggleUnderline().run()
              }
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Tachado"
              pressed={isActionActive("strike")}
              onPressedChange={() =>
                editor.chain().focus().toggleStrike().run()
              }
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 px-3 border-r border-gray-100 shrink-0">
            <Popover
              open={isLinkPopoverOpen}
              onOpenChange={setIsLinkPopoverOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Toggle
                      type="button"
                      size="sm"
                      pressed={isActionActive("link")}
                      className={cn(
                        "h-9 w-9 md:h-8 md:w-8 rounded-lg shrink-0 transition-colors",
                        isActionActive("link")
                          ? "bg-[var(--puembo-green)]/20 text-[var(--puembo-green)] border border-[var(--puembo-green)]/30"
                          : "text-gray-500 hover:bg-gray-100",
                      )}
                      onClick={() =>
                        setLinkUrl(editor.getAttributes("link").href || "")
                      }
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Toggle>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="hidden md:block text-[10px] font-bold uppercase tracking-widest bg-black text-white border-none shadow-xl"
                >
                  Enlace
                </TooltipContent>
              </Tooltip>
              <PopoverContent
                className="w-[calc(100vw-2rem)] sm:w-80 p-4 shadow-2xl rounded-2xl bg-white border border-gray-200 z-[100001]"
                align="start"
                sideOffset={10}
              >
                <div className="space-y-4">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                      Insertar Enlace
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Pega la dirección web completa.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://ejemplo.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="h-10 text-sm rounded-xl bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:text-gray-900 focus:ring-4 focus:ring-[var(--puembo-green)]/10"
                      onKeyDown={(e) => e.key === "Enter" && setLink()}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={setLink}
                      className="h-10 px-4 bg-[var(--puembo-green)] rounded-xl font-bold text-white hover:bg-[var(--puembo-green)]/90 shadow-lg shadow-[var(--puembo-green)]/20"
                    >
                      OK
                    </Button>
                  </div>
                  {isActionActive("link") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeLink}
                      className="w-full h-9 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl gap-2"
                    >
                      <Unlink className="w-3.5 h-3.5" /> Quitar enlace
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <ToolbarButton
              title="Bloque de Código"
              pressed={isActionActive("codeBlock")}
              onPressedChange={() =>
                editor.chain().focus().toggleCodeBlock().run()
              }
            >
              <CodeSquare className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 px-3 border-r border-gray-100 shrink-0">
            <ToolbarButton
              title="Lista con Viñetas"
              pressed={isActionActive("bulletList")}
              onPressedChange={() =>
                editor.chain().focus().toggleBulletList().run()
              }
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Lista Numerada"
              pressed={isActionActive("orderedList")}
              onPressedChange={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Cita"
              pressed={isActionActive("blockquote")}
              onPressedChange={() =>
                editor.chain().focus().toggleBlockquote().run()
              }
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 px-3 shrink-0">
            <ToolbarButton
              title="Alinear Izquierda"
              pressed={isActionActive({ textAlign: "left" })}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign("left").run()
              }
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Centrar"
              pressed={isActionActive({ textAlign: "center" })}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Alinear Derecha"
              pressed={isActionActive({ textAlign: "right" })}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign("right").run()
              }
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="ml-auto pl-3 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().unsetAllMarks().clearNodes().run()
                  }
                  className="h-10 w-10 md:h-9 md:w-9 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <RemoveFormatting className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="hidden md:block text-[10px] font-bold uppercase tracking-widest bg-black text-white border-none shadow-xl"
              >
                Limpiar Formato
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex-grow bg-white min-h-[300px]">
          <EditorContent editor={editor} />
        </div>

        <style jsx global>{`
          .tiptap-editor .is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
          }
          .tiptap-editor {
            outline: none !important;
          }
          .tiptap-editor blockquote {
            border-left: 4px solid var(--puembo-green);
            padding-left: 1.5rem;
            font-style: italic;
            color: #4b5563;
            margin: 1.5rem 0;
          }
          .tiptap-editor ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 1rem 0;
          }
          .tiptap-editor ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 1rem 0;
          }
          .tiptap-editor a {
            color: var(--puembo-green);
            text-decoration: underline;
            cursor: pointer;
          }
          .tiptap-editor h2 {
            font-size: 1.5rem;
            font-weight: 800;
            margin-top: 2rem;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          .tiptap-editor h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            line-height: 1.2;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
};

export default RichTextEditor;