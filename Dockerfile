FROM node:18

ARG BASE_DIR=/opt
ARG PIPEDREAM_DIR=$BASE_DIR/pipedream

WORKDIR $BASE_DIR

# clone project and install dependencies
# TODO: change from pipedream master to private/local components
RUN git clone https://github.com/PipedreamHQ/pipedream.git && \
    cd pipedream && \
    npm i && \
    npx pnpm i

WORKDIR $PIPEDREAM_DIR

# install debug dependencies
RUN npm i dotenv js-yaml esprima escodegen

# copy vscode debug files
COPY ./debug/.vscode $PIPEDREAM_DIR/.vscode
COPY ./debug $PIPEDREAM_DIR/debug

# run debug
CMD [ "node", "./debug/src/launch.mjs" ]
