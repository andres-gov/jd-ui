class TagTypeGroup < ActiveRecord::Base
    has_many :tag_types
    belongs_to :organization
    
    validates_uniqueness_of :name
    validates_presence_of :name
    validates_presence_of :color
    
    before_create :downcase
    
    private
        def downcase
            self.name.downcase!
        end
end