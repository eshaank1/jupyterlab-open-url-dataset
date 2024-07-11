import {
  IRouter,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { showErrorMessage } from '@jupyterlab/apputils';

import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

/**
 * The regular expression matching the lab URL.
 */
const URL_PATTERN = new RegExp('/(lab|notebooks|edit)/?');

/**
 * Initialization data for the jupyterlab-open-url-dataset extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-open-url-dataset:plugin',
  autoStart: true,
  requires: [IRouter, ITranslator],
  optional: [IDefaultFileBrowser],
  activate: (
    app: JupyterFrontEnd,
    router: IRouter,
    translator: ITranslator,
    browser: IDefaultFileBrowser | null
  ) => {
    const { commands } = app;
    const trans = translator.load('jupyterlab') ?? nullTranslator;

    const command = 'router:fromUrl';
    commands.addCommand(command, {
      execute: async (args: any) => {
        const parsed = args as IRouter.ILocation;
        // use request to do the matching
        const { request, search } = parsed;
        const matches = request.match(URL_PATTERN) ?? [];
        if (!matches) {
          return;
        }

        const urlParams = new URLSearchParams(search);
        const paramName = 'datasetURL';
        const datasetUrl = urlParams.get(paramName);
        if (!datasetUrl || datasetUrl.length === 0) {
          return;
        }

        // handle the route and remove the datasetURL parameter
        const handleRoute = () => {
          const url = new URL(URLExt.join(PageConfig.getBaseUrl(), request));
          // only remove the datasetURL parameter
          url.searchParams.delete(paramName);
          const { pathname, search } = url;
          router.navigate(`${pathname}${search}`, { skipRouting: true });
        };

        // fetch the JSON manifest and extract file URLs
        let fileEntries: { url: string }[] = [];
        try {
          const response = await fetch(datasetUrl);
          if (response.status !== 200) {
            throw new Error(`Failed to fetch dataset URL: ${datasetUrl}`);
          }
          const manifest = await response.json();
          fileEntries = manifest.map((entry: any) => ({ url: entry.url }));
          console.log('Fetched file entries:', fileEntries);
        } catch (err: unknown) {
          if (err instanceof Error) {
            return showErrorMessage(
              trans.__('Cannot fetch dataset manifest'),
              err
            );
          } else {
            return showErrorMessage(
              trans.__('Cannot fetch dataset manifest'),
              String(err)
            );
          }
        }

        // fetch the file from the URL and open it with the docmanager
        const fetchAndOpen = async (url: string): Promise<void> => {
          let type = '';
          let blob;

          // fetch the file from the URL
          try {
            const req = await fetch(url);
            blob = await req.blob();
            type = req.headers.get('Content-Type') ?? '';
          } catch (err: unknown) {
            const reason = err as any;
            if (reason.response && reason.response.status !== 200) {
              reason.message = trans.__('Could not open URL: %1', url);
            }
            return showErrorMessage(trans.__('Cannot fetch'), reason);
          }

          // upload the content of the file to the server
          try {
            // FIXME: handle Content-Disposition: https://github.com/jupyterlab/jupyterlab/issues/11531
            const name = url.substring(url.lastIndexOf('/') + 1); // extract file name
            const file = new File([blob], name, { type });
            const model = await browser?.model.upload(file);
            console.log('Uploaded file model:', model);
            if (!model || typeof model.path !== 'string') {
              throw new Error(
                'Failed to upload the file or invalid file path received.'
              );
            }
            return commands.execute('docmanager:open', {
              path: model.path,
              options: {
                ref: '_noref'
              }
            });
          } catch (error: unknown) {
            if (error instanceof Error) {
              return showErrorMessage(
                trans._p('showErrorMessage', 'Upload Error'),
                error
              );
            } else {
              return showErrorMessage(
                trans._p('showErrorMessage', 'Upload Error'),
                String(error)
              );
            }
          }
        };

        const [match] = matches;
        // handle opening the URL with the Notebook 7 separately
        if (match?.includes('/notebooks') || match?.includes('/edit')) {
          const [first] = fileEntries;
          await fetchAndOpen(first.url);
          handleRoute();
          return;
        }

        app.restored.then(async () => {
          await Promise.all(fileEntries.map(entry => fetchAndOpen(entry.url)));
          handleRoute();
        });
      }
    });

    router.register({ command, pattern: URL_PATTERN });
  }
};

export default plugin;
