import {Extension} from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font family
       * @param fontFamily The font family
       * @example editor.commands.setFontFamily('Arial')
       */
      setFontSize: (fontSize: string) => ReturnType,
      /**
       * Unset the font family
       * @example editor.commands.unsetFontFamily()
       */
      unsetFontSize: () => ReturnType,
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({chain}) => {
        return chain()
          .setMark('textStyle', {fontSize})
          .run()
      },
      unsetFontSize: () => ({chain}) => {
        return chain()
          .setMark('textStyle', {fontSize: null})
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
});