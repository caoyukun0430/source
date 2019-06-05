// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  webServicePath: "http://localhost:5000/",
  enableUpload: true,
  enableDownload: true,
  enableLogin: false,
  loginTextHint: 'Username: admin Password: admin will give you full access to the system. Username: user1 Password: user1 will give you access to the running-example log along with the possibility to download the running-example. Username: user2 Password: user2 will give you access to the receipt log but without the possibility to download the log.'
};
