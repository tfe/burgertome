class Order < ActiveRecord::Base
  belongs_to :user
  
  def lat_lng_for_url
    "#{self.lat},#{self.lng}"
  end
  
  def remote_url
    "#{Taskrabbit.base_uri}#{self.remote_path}"
  end
  
  def decorated_description
    "In-N-Out Delivery: \n\n#{self.description}"
  end
end
