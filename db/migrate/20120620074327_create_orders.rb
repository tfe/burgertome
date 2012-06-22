class CreateOrders < ActiveRecord::Migration
  def change
    create_table :orders do |t|
      t.integer :user_id
      t.integer :remote_id
      t.string :remote_path
      t.string :state
      t.text :description
      t.string :location
      t.string :lat
      t.string :lng

      t.timestamps
    end
  end
end
