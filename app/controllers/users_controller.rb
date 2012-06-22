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

    # set a flash message and lay down their cookie
    flash.notice = "Logged in as #{user.display_name}"
    cookies[:user_id] = user.id

    redirect_to :root
  end

  def logout
    cookies.delete :user_id
    redirect_to :root
  end

end
