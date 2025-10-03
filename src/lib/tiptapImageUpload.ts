import { Image } from '@tiptap/extension-image';
import { Plugin } from '@tiptap/pm/state';
import { api } from './api'; // Your API service

export const TiptapImageUpload = Image.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const hasFiles = event.dataTransfer?.files?.length;
              if (!hasFiles) return false;

              const images = Array.from(event.dataTransfer.files).filter((file) =>
                /image/i.test(file.type)
              );
              if (images.length === 0) return false;

              event.preventDefault();

              images.forEach(async (image) => {
                const { url } = await api.uploadImage(image);
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              });

              return true;
            },
            paste(view, event) {
              const hasFiles = event.clipboardData?.files?.length;
              if (!hasFiles) return false;

              const images = Array.from(event.clipboardData.files).filter((file) =>
                /image/i.test(file.type)
              );
              if (images.length === 0) return false;

              event.preventDefault();

              images.forEach(async (image) => {
                const { url } = await api.uploadImage(image);
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              });
              
              return true;
            },
          },
        },
      }),
    ];
  },
});