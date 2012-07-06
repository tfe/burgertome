class UsersController < ApplicationController

  def test
    render :layout => 'application' and return
  end

  # callback from Taskrabbit OAuth
  def login
    # fetch user account info from TaskRabbit API
    remote_info = User.fetch_user_details(params[:access_token])

    # set up the user if not already present
    user = User.find_or_initialize_by_remote_id(remote_info['id'])

    # ensure their info is fresh
    user.token = params[:access_token]
    user.display_name = remote_info['display_name']
    user.save!

    # lay down their cookie and save their username for the view
    session[:current_user_id] = user.id
    @user_name = user.display_name
    
    render :login, :layout => false
  end

  def logout
    @current_user = nil
    session[:current_user_id] = nil
    redirect_to :root
  end

end
