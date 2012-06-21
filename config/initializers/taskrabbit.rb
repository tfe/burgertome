# See the README for notes on setting these environment variables.
# The values will be given to you after registering your app as a new OAuth Application on TaskRabbit.
# The base_uri could potentially be your developer sandbox URL.
Taskrabbit.configure do |config|
  config.client_secret = ENV['TR_CLIENT_SECRET']
  config.base_uri      = ENV['TR_BASE_URI']
end
