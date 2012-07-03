class OrdersController < ApplicationController

  def new
    @order = Order.new
  end

  def show
    @order = current_user.orders.find(params[:id])
  end

  def create
    if not current_user
      flash[:error] = "Sorry, you must log in with TaskRabbit first before placing an order."
      render :new and return
    end

    tr = Taskrabbit::Api.new(current_user.token)

    @order = current_user.orders.new
    @order.description = params[:order_description]
    @order.location = params[:address_full]
    @order.lat = params[:address_lat]
    @order.lng = params[:address_lng]

    task = tr.tasks.create({
      :task_type => "Deliver Now",
      :description => @order.decorated_description,
      :other_locations_attributes => [{ 
        :address => params[:address_address],
        :city    => params[:address_city],
        :state   => params[:address_state],
        :zip     => params[:address_zip],
        :lat     => @order.lat,
        :lng     => @order.lng,
      }]
    })

    flash[:error] = task.error

    @order.remote_id = task.id
    @order.remote_path = task.links["get"]
    @order.state = task.state

    if @order.save
      redirect_to order_path(@order)
    else
      render :new and return
    end
  end
end
