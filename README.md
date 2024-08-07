# jupyterlab-open-url-dataset

[![Extension status](https://img.shields.io/badge/status-draft-orange 'in development')](https://google.com)
[![Github Actions Status](https://github.com/eshaank1/jupyterlab-open-url-dataset/workflows/Build/badge.svg)](https://github.com/eshaank1/jupyterlab-open-url-dataset/actions/workflows/build.yml)
[![JupyterLite](https://jupyterlite.rtfd.io/en/latest/_static/badge-launch.svg)](https://google.com)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/eshaank1/jupyterlab-open-url-dataset/main?urlpath=lab)

JupyterLab extension to open files from a dataset manifest passed via a URL parameter.

## Requirements

- JupyterLab >= 4.0

## Install

To install the extension, run the following command:

```bash
pip install jupyterlab-open-url-dataset
```

## Usage

The extension will open all files from a dataset manifest passed via a URL parameter. The URL parameter is `datasetURL`. The files will be opened in the order they are listed on the manifest.

For example if you would like to open a dataset manifest consisting of two images:

- https://g-062a3c.0ed28.75bc.data.globus.org/public/sample-manifest.json

You can append the following to the URL of your JupyterLab instance: `?datasetURL=https://g-062a3c.0ed28.75bc.data.globus.org/public/sample-manifest.json`

Which will result in the following URL when JupyterLab is running locally:

http://localhost:8888/lab?datasetURL=https://g-062a3c.0ed28.75bc.data.globus.org/public/sample-manifest.json

ℹ️ This extension uses the command `filebrowser:open-url` available in JupyterLab by default.

### Using the extension in JupyterLite

The extension can also be used in [JupyterLite](https://jupyterlite.readthedocs.io). Check out the documentation to learn more about adding extensions to JupyterLite.

## Uninstall

To remove the extension, run the following command:

```bash
pip uninstall jupyterlab-open-url-dataset
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_open_url_dataset directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab-open-url-dataset
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-open-url-dataset` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
